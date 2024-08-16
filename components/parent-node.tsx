import React, { useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';

interface ParentNodeProps {
  selectedComponent: Component;
  calculateTotals: {
    titleTotals: { [key: string]: number };
    titleItems: { [key: string]: any[] };
  };
}

const ParentNode: React.FC<ParentNodeProps> = ({ selectedComponent, calculateTotals }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      Object.entries(calculateTotals.titleItems).flatMap(([title, items]) =>
        items.map((item) => ({
          NID: item.nid,
          Descripción: item.descripcion,
          'Unidad de Medida': item.unidadMedida,
          Recursos: item.recursos,
          Cantidad: item.cantidad,
          'Depreciación (%)': item.depreciacion,
          Precio: item.precio,
          Total: item.total,
        }))
      )
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Metrado");

    XLSX.writeFile(workbook, `Metrado_${selectedComponent.name}.xlsx`);
  };

  const totalGeneral = useMemo(() => {
    return Object.values(calculateTotals.titleTotals).reduce((sum, value) => sum + value, 0);
  }, [calculateTotals]);

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
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              Exportar a Excel
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
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
              {Object.entries(calculateTotals.titleTotals).map(([title, total]) => (
                <React.Fragment key={title}>
                  <TableRow className="border-b border-gray-200 dark:border-gray-700">
                    <TableCell colSpan={8} className="py-1 font-bold text-blue-500">
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
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7} className="text-right font-medium">
                  Costo unitario por {selectedComponent.id}:
                </TableCell>
                <TableCell className="text-right font-bold text-xl text-green-600">
                  S/. {totalGeneral.toFixed(2)}
                </TableCell>
              </TableRow>  
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentNode;