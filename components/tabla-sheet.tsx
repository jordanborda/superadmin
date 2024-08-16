import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Button } from "@/components/ui/button";
import { Plus, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import { suggestionsTable } from '@/utils/suggestionsTable';
import { useToast } from "@/components/ui/use-toast";
import { Trash } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  children: Component[];
  isRegistered: boolean;
  color: string;
}

interface TablaSheetProps {
  selectedComponent: Component | null;
  isParentNode: boolean;
}

interface RowData {
  id: number;
  nid: string;
  type: 'title' | 'item';
  parentId: number | null;
  descripcion: string;
  unidadMedida: string;
  recursos: string;
  cantidad: string;
  depreciacion: string;
  precio: string;
  total: number;
}

const nidColors = [
  'font-bold text-blue-500',
  'font-bold text-yellow-500',
];

const TablaSheet: React.FC<TablaSheetProps> = ({ selectedComponent, isParentNode }) => {
  const [unidadMedida, setUnidadMedida] = useState<string>('');
  const [rendimiento, setRendimiento] = useState<number>(0);
  const [rendimientoDias, setRendimientoDias] = useState<number>(0);
  const [horas, setHoras] = useState<number>(0);
  const [rows, setRows] = useState<RowData[]>([]);
  const [suggestions, setSuggestions] = useState<{ [key: number]: string }>({});
  const inputRefs = useRef<{ [key: number]: HTMLInputElement }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (selectedComponent) {
      const storedData = localStorage.getItem(`tablaSheetData_${selectedComponent.id}`);
      if (storedData) {
        setRows(JSON.parse(storedData));
      } else {
        setRows([]);
      }
      const storedUnidadMedida = localStorage.getItem(`unidadMedida_${selectedComponent.id}`) || '';
      setUnidadMedida(storedUnidadMedida);
      const storedRendimiento = Number(localStorage.getItem(`rendimiento_${selectedComponent.id}`) || 0);
      setRendimiento(storedRendimiento);
      const storedRendimientoDias = Number(localStorage.getItem(`rendimientoDias_${selectedComponent.id}`) || 0);  
      setRendimientoDias(storedRendimientoDias);
      const storedHoras = Number(localStorage.getItem(`horas_${selectedComponent.id}`) || 0);
      setHoras(storedHoras);
    } else {
      setRows([]);
      setUnidadMedida('');
      setRendimiento(0);
      setRendimientoDias(0);
      setHoras(0);
    }
  }, [selectedComponent]);

  useEffect(() => {
    if (selectedComponent) {
      localStorage.setItem(`tablaSheetData_${selectedComponent.id}`, JSON.stringify(rows));
      localStorage.setItem(`unidadMedida_${selectedComponent.id}`, unidadMedida);
      localStorage.setItem(`rendimiento_${selectedComponent.id}`, String(rendimiento));
      localStorage.setItem(`rendimientoDias_${selectedComponent.id}`, String(rendimientoDias));
      localStorage.setItem(`horas_${selectedComponent.id}`, String(horas));
    }
  }, [selectedComponent, rows, unidadMedida, rendimiento, rendimientoDias, horas]);

  const calculateTotals = useMemo(() => {
    const totals: { [key: number]: number } = {};
    rows.forEach(row => {
      if (row.type === 'item') {
        totals[row.parentId!] = (totals[row.parentId!] || 0) + row.total;
      }
    });

    const titleTotals: { [key: string]: number } = {};
    const titleItems: { [key: string]: string[] } = {};
    
    if (isParentNode) {
      selectedComponent?.children.forEach(child => {
        const childData = localStorage.getItem(`tablaSheetData_${child.id}`);
        if (childData) {
          const childRows: RowData[] = JSON.parse(childData);
          childRows.forEach(row => {
            if (row.type === 'item') {
              const parentTitle = childRows.find(r => r.id === row.parentId)?.descripcion;
              if (parentTitle) {
                titleTotals[parentTitle] = (titleTotals[parentTitle] || 0) + row.total;
                if (!titleItems[parentTitle]) {
                  titleItems[parentTitle] = [];
                }
                const itemIndex = titleItems[parentTitle].findIndex(item => item.descripcion === row.descripcion);
                if (itemIndex !== -1) {
                  titleItems[parentTitle][itemIndex].total += row.total;
                } else {
                  titleItems[parentTitle].push({
                    descripcion: row.descripcion,
                    unidadMedida: row.unidadMedida,
                    recursos: row.recursos,
                    cantidad: row.cantidad,
                    depreciacion: row.depreciacion,
                    precio: row.precio,
                    total: row.total,
                  });
                }
              }
            }
          });
        }
      });
    } else {
      rows.forEach(row => {
        if (row.type === 'item') {
          const parentTitle = rows.find(r => r.id === row.parentId)?.descripcion;
          if (parentTitle) {
            titleTotals[parentTitle] = (titleTotals[parentTitle] || 0) + row.total;
            if (!titleItems[parentTitle]) {
              titleItems[parentTitle] = [];
            }
            if (!titleItems[parentTitle].includes(row.descripcion)) {
              titleItems[parentTitle].push(row.descripcion);
            }
          }
        }
      });
    }

    return { componentTotals: totals, titleTotals, titleItems };
  }, [rows, isParentNode, selectedComponent]);

  const totalGeneral = useMemo(() => {
    return Object.values(calculateTotals.componentTotals).reduce((sum, value) => sum + value, 0);
  }, [calculateTotals]);

  const totalCompleto = useMemo(() => {
    return rows.reduce((sum, row) => sum + (row.type === 'title' ? calculateTotals.componentTotals[row.id] || 0 : 0), 0);
  }, [rows, calculateTotals]);

  const calculateRowTotal = (cantidad: string, precio: string, depreciacion: string) => {
    const cantidadNum = parseFloat(cantidad) || 0;
    const precioNum = parseFloat(precio) || 0;
    const depreciacionNum = parseFloat(depreciacion) || 0;
    const subtotal = cantidadNum * precioNum;
    return subtotal - (subtotal * (depreciacionNum / 100));
  };

  const generateNID = (parentNID: string | null, index: number) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (!parentNID) {
      return `${letters[index]}1`;
    }
    return `${parentNID}.${index + 1}`;
  };

  const addTitle = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const titleIndex = rows.filter(r => r.type === 'title').length;
    const newNID = `${selectedComponent?.id}.${titleIndex + 1}`;
    const newRow: RowData = {
      id: newId,
      nid: newNID,
      type: 'title',
      parentId: null,
      descripcion: 'NUEVO TÍTULO',
      unidadMedida: '',
      recursos: '',
      cantidad: '',
      depreciacion: '',
      precio: '',
      total: 0
    };
    setRows([...rows, newRow]);
  };
  

  const addItem = (parentId: number) => {
    const parent = rows.find(r => r.id === parentId);
    if (!parent) return;
  
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const childrenCount = rows.filter(r => r.parentId === parentId).length;
    const newNID = `${parent.nid}.${childrenCount + 1}`;
    const newRow: RowData = {
      id: newId,
      nid: newNID,
      type: 'item',
      parentId,
      descripcion: '',
      unidadMedida: '',
      recursos: '',
      cantidad: '',
      depreciacion: '',
      precio: '',
      total: 0  
    };

    const parentIndex = rows.findIndex(r => r.id === parentId);
    const insertIndex = rows.findIndex((r, index) => 
      index > parentIndex && (r.type === 'title' || (r.type === 'item' && r.parentId !== parentId))  
    );
  
    const newRows = [
      ...rows.slice(0, insertIndex === -1 ? rows.length : insertIndex),
      newRow,
      ...rows.slice(insertIndex === -1 ? rows.length : insertIndex)
    ];
  
    setRows(newRows);
  };

  const handleInputChange = (rowId: number, field: keyof RowData, value: string) => {
    const uppercaseValue = value.toUpperCase();
    
    setRows(prevRows => 
      prevRows.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: uppercaseValue };
          if (row.type === 'item') {
            updatedRow.total = calculateRowTotal(
              field === 'cantidad' ? value : row.cantidad,
              field === 'precio' ? value : row.precio,
              field === 'depreciacion' ? value : row.depreciacion
            );
          }
          return updatedRow;
        }
        return row;
      })
    );

    if (field === 'descripcion') {
      const row = rows.find(r => r.id === rowId);
      if (row) {
        let suggestionList: string[] = [];
        if (row.type === 'title') {
          suggestionList = suggestionsTable.titles;
        } else {
          const parentTitle = rows.find(r => r.id === row.parentId)?.descripcion;
          if (parentTitle && suggestionsTable.items[parentTitle as keyof typeof suggestionsTable.items]) {
            suggestionList = suggestionsTable.items[parentTitle as keyof typeof suggestionsTable.items];
          }
        }

        const matchingSuggestion = suggestionList.find(s => 
          s.toUpperCase().startsWith(uppercaseValue) && s.toUpperCase() !== uppercaseValue
        );

        setSuggestions(prev => ({
          ...prev,  
          [rowId]: matchingSuggestion || ''
        }));
      }
    } else {
      setSuggestions(prev => ({
        ...prev,
        [rowId]: ''
      }));
    }
  };

  const applySuggestion = (rowId: number) => {
    const suggestion = suggestions[rowId];
    if (suggestion) {
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === rowId ? { ...row, descripcion: suggestion } : row  
        )
      );
      setSuggestions(prev => ({
        ...prev,
        [rowId]: ''
      }));
    }
  };

  const getNIDColor = (nid: string) => {
    const depth = nid.split('.').length - 1;
    return nidColors[depth % nidColors.length];
  };

  const deleteItem = (itemId: number) => {
    setRows(prevRows => prevRows.filter(row => row.id !== itemId));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows.map(row => ({
      NID: row.nid,
      Tipo: row.type,
      Descripción: row.descripcion,
      'Unidad de Medida': row.unidadMedida,
      Recursos: row.recursos,
      Cantidad: row.cantidad,
      'Depreciación (%)': row.depreciacion,
      Precio: row.precio,
      Total: row.total
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Metrado");

    XLSX.writeFile(workbook, `Metrado_${selectedComponent?.name || 'Componente'}.xlsx`);
  };

  if (!selectedComponent) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-center text-gray-500">Selecciona un componente hoja para ver sus detalles.</p>
        </CardContent>
      </Card>
    );
  }

return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3">
        <CardTitle className="text-xl font-bold flex justify-between items-center">
          <span>
            {selectedComponent.id} - {selectedComponent.name}
            <span className="ml-4 text-green-600 dark:text-green-400">
              Total: S/. {totalGeneral.toFixed(2)}
            </span>
          </span>
          <div>
            {!isParentNode && (
              <Button variant="outline" size="sm" onClick={addTitle} className="mr-2">
                Agregar Título
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              Exportar a Excel
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
        {!isParentNode && (
          <div className="grid grid-cols-4 gap-2 p-4 bg-gray-100 dark:bg-gray-800">
            <div>
              <Label htmlFor="unidadMedida" className="text-xs">Unidad de Medida</Label>
              <Input 
                id="unidadMedida" 
                value={unidadMedida} 
                onChange={(e) => setUnidadMedida(e.target.value)}
                className="h-8 text-sm"
              />  
            </div>
            <div>
              <Label htmlFor="rendimiento" className="text-xs">Rendimiento</Label>
              <Input 
                id="rendimiento" 
                type="number" 
                value={rendimiento} 
                onChange={(e) => setRendimiento(Number(e.target.value))}
                className="h-8 text-sm"  
              />
            </div>
            <div>
              <Label htmlFor="rendimientoDias" className="text-xs">Rendimiento en Días</Label>
              <Input 
                id="rendimientoDias" 
                type="number" 
                value={rendimientoDias} 
                onChange={(e) => setRendimientoDias(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="horas" className="text-xs">Horas</Label>
              <Input 
                id="horas" 
                type="number" 
                value={horas} 
                onChange={(e) => setHoras(Number(e.target.value))}  
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}
        
        <div className="flex-grow overflow-auto relative">
        <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-20">
              <TableRow className="border-b border-gray-200 dark:border-gray-700">
                <TableHead className="py-2">NID</TableHead>
                <TableHead className="py-2 w-1/3">Descripción</TableHead>  
                <TableHead className="py-2">Unidad</TableHead>
                <TableHead className="py-2">Recursos</TableHead>
                <TableHead className="py-2 text-right">Cantidad</TableHead>
                <TableHead className="py-2 text-right">% Dep.</TableHead>
                <TableHead className="py-2 text-right">Precio</TableHead>
                <TableHead className="py-2 text-right">Total</TableHead>
                <TableHead className="py-2"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isParentNode ? (
                Object.entries(calculateTotals.titleTotals).map(([title, total]) => (
                  <React.Fragment key={title}>
                    <TableRow className="border-b border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={9} className="py-1 font-bold text-blue-500">
                        {title}
                      </TableCell>
                    </TableRow>
                    {calculateTotals.titleItems[title].map((item, index) => (
                      <TableRow key={`${title}-${index}`} className="border-b border-gray-200 dark:border-gray-700">
                        <TableCell className="py-1">{item.nid}</TableCell>
                        <TableCell className="py-1 pl-8">
                          {item.descripcion}
                        </TableCell>
                        <TableCell className="py-1">
                          {item.unidadMedida}
                        </TableCell>
                        <TableCell className="py-1">
                          {item.recursos}
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          {item.cantidad}
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          {item.depreciacion}
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          {item.precio}
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          {item.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="py-1"></TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} className="border-b border-gray-200 dark:border-gray-700">
                    <TableCell className={`py-1 font-medium ${getNIDColor(row.nid)}`}>{row.nid}</TableCell>
                    <TableCell className="py-1">
                      <div className={`flex items-center ${row.type === 'item' ? 'ml-8' : ''} relative`}>
                        <div className="relative flex-grow">
                          <Input 
                            ref={el => {
                              if (el) inputRefs.current[row.id] = el;
                            }}
                            value={row.descripcion}
                            onChange={(e) => handleInputChange(row.id, 'descripcion', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Tab' || e.key === 'Enter') {
                                e.preventDefault();
                                applySuggestion(row.id);
                              }
                            }}
                            className={`border-none bg-transparent uppercase w-full ${row.type === 'title' ? 'font-bold' : ''}`}
                          />
                          <div 
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: '0.75rem', 
                              paddingRight: '0.75rem',
                            }}
                          >
                            <div className={`whitespace-pre ${row.type === 'title' ? 'font-bold' : ''}`}>
                              <span>{row.descripcion}</span>
                              {suggestions[row.id] && (
                                <span className="text-blue-400" style={{ opacity: 0.7 }}>
                                  {suggestions[row.id].slice(row.descripcion.length)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {row.type === 'title' && (
                          <Button
                            variant="outline"
                            size="sm" 
                            onClick={() => addItem(row.id)}
                            className="ml-2 px-2 py-1 h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Item
                          </Button>
                        )}
                      </div>
                      </TableCell>
                    {row.type === 'item' ? (
                      <>
                        <TableCell className="py-1">
                          <Input 
                            value={row.unidadMedida}
                            onChange={(e) => handleInputChange(row.id, 'unidadMedida', e.target.value)}  
                            className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-md px-2 py-1 h-7 text-sm"
                          />
                        </TableCell>
                        <TableCell className="py-1">  
                          <Input
                            value={row.recursos}
                            onChange={(e) => handleInputChange(row.id, 'recursos', e.target.value)}
                            className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-md px-2 py-1 h-7 text-sm"  
                          />
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          <Input
                            type="number" 
                            value={row.cantidad}
                            onChange={(e) => handleInputChange(row.id, 'cantidad', e.target.value)}
                            className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-md px-2 py-1 h-7 text-sm text-right"
                          />  
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          <Input
                            type="number"
                            value={row.depreciacion} 
                            onChange={(e) => handleInputChange(row.id, 'depreciacion', e.target.value)}
                            className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-md px-2 py-1 h-7 text-sm text-right"
                          />
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          <Input
                            type="number" 
                            value={row.precio}
                            onChange={(e) => handleInputChange(row.id, 'precio', e.target.value)} 
                            className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-md px-2 py-1 h-7 text-sm text-right"
                          />
                        </TableCell>
                        <TableCell className="py-1 text-right font-bold">
                          {row.total.toFixed(2)}
                        </TableCell>  
                      </>
                    ) : (
                      <TableCell colSpan={6} />  
                    )}
                    <TableCell className="py-1">
                      {row.type === 'item' && (
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(row.id)}
                          className="p-0 h-6 w-6 text-red-500 hover:text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isParentNode && (
                Object.entries(calculateTotals.titleTotals).map(([title, total]) => (
                  <TableRow key={title} className="border-b border-gray-200 dark:border-gray-700">
                    <TableCell colSpan={7} className="py-1 text-right font-medium">
                      Total {title}:
                    </TableCell>
                    <TableCell colSpan={2} className="py-1 text-right font-bold text-yellow-600">
                      S/. {total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7} className="text-right font-medium">
                  Costo unitario por {unidadMedida || 'unidad'}:
                </TableCell>
                <TableCell colSpan={2} className="text-right font-bold text-xl text-green-600">
                  S/. {totalCompleto.toFixed(2)}
                </TableCell>
              </TableRow>  
            </TableFooter>
          </Table>
        </div>
        {!isParentNode && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center">
            <Button variant="default" size="sm" onClick={() => {
              localStorage.setItem(`tablaSheetData_${selectedComponent.id}`, JSON.stringify(rows));
              toast({
                title: "Guardado exitoso",
                description: "Los datos de la tabla han sido guardados.",
              });
            }}>
              <Save className="h-4 w-4 mr-2" /> Guardar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TablaSheet;