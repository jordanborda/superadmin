import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { suggestionsTable } from '@/utils/suggestionsTable';


interface Component {
  id: string;
  name: string;
  children: Component[];
  isRegistered: boolean;
  color: string;
}

interface TablaSheetProps {
  selectedComponent: Component | null;
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
    'text-blue-500',
    'text-yellow-500',
  ];

const TablaSheet: React.FC<TablaSheetProps> = ({ selectedComponent }) => {
  const [unidadMedida, setUnidadMedida] = useState<string>('');
  const [rendimiento, setRendimiento] = useState<number>(0);
  const [rendimientoDias, setRendimientoDias] = useState<number>(0);
  const [horas, setHoras] = useState<number>(0);
  const [rows, setRows] = useState<RowData[]>([]);
  const [suggestions, setSuggestions] = useState<{ [key: number]: string }>({});
  const inputRefs = useRef<{ [key: number]: HTMLInputElement }>({});

  useEffect(() => {
    if (selectedComponent) {
      setRows([]);
      setUnidadMedida('');
      setRendimiento(0);
      setRendimientoDias(0);
      setHoras(0);
    }
  }, [selectedComponent]);

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
    const newNID = generateNID(null, titleIndex);
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
    const newNID = generateNID(parent.nid, childrenCount);
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

    // Find the index to insert the new item
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

  const calculateTotals = useMemo(() => {
    const totals: { [key: number]: number } = {};
    rows.forEach(row => {
      if (row.type === 'item') {
        totals[row.parentId!] = (totals[row.parentId!] || 0) + row.total;
      }
    });
    return totals;
  }, [rows]);

  const totalGeneral = useMemo(() => {
    return Object.values(calculateTotals).reduce((sum, value) => sum + value, 0);
  }, [calculateTotals]);

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

  const getNIDColor = (nid: string) => {
    const depth = nid.split('.').length - 1;
    return nidColors[depth % nidColors.length];
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
            <Button variant="outline" size="sm" onClick={addTitle} className="mr-2">
              Agregar Título
            </Button>
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              Exportar a Excel
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
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
                            paddingLeft: '0.75rem', // Ajusta este valor para que coincida con el padding del input
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
                    </>
                  ) : (
                    <TableCell colSpan={5} />
                  )}
                  <TableCell className="py-1 text-right font-bold">
                    {row.type === 'title' 
                      ? <span className="text-yellow-600">{calculateTotals[row.id]?.toFixed(2) || '0.00'}</span>
                      : row.total.toFixed(2)
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default TablaSheet;