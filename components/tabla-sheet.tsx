import React, { useState, useEffect, useMemo } from 'react';
import ChildNode from './child-node';
import ParentNode from './parent-node';
import { useToast } from "@/components/ui/use-toast";
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

const TablaSheet: React.FC<TablaSheetProps> = ({ selectedComponent }) => {
  const [unidadMedida, setUnidadMedida] = useState<string>('');
  const [rendimiento, setRendimiento] = useState<number>(0);
  const [rendimientoDias, setRendimientoDias] = useState<number>(0);
  const [horas, setHoras] = useState<number>(0);
  const [rows, setRows] = useState<RowData[]>([]);
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
      localStorage.setItem(`unidadMedida_${selectedComponent.id}`, unidadMedida);
      localStorage.setItem(`rendimiento_${selectedComponent.id}`, String(rendimiento));
      localStorage.setItem(`rendimientoDias_${selectedComponent.id}`, String(rendimientoDias));
      localStorage.setItem(`horas_${selectedComponent.id}`, String(horas));
    }
  }, [selectedComponent, unidadMedida, rendimiento, rendimientoDias, horas]);

  const calculateTotals = useMemo(() => {
    const totals: { [key: number]: number } = {};
    const titleTotals: { [key: string]: number } = {};
    const titleItems: { [key: string]: any[] } = {};

    const processComponent = (component: Component) => {
      const componentData = localStorage.getItem(`tablaSheetData_${component.id}`);
      if (componentData) {
        const componentRows: RowData[] = JSON.parse(componentData);
        componentRows.forEach(row => {
          if (row.type === 'item') {
            const parentTitle = componentRows.find(r => r.id === row.parentId)?.descripcion;
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
                  nid: row.nid,
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

      component.children.forEach(child => {
        processComponent(child);
      });
    };

    if (selectedComponent) {
      processComponent(selectedComponent);
    } else {
      rows.forEach(row => {
        if (row.type === 'item') {
          totals[row.parentId!] = (totals[row.parentId!] || 0) + row.total;
        }
      });
    }

    return { componentTotals: totals, titleTotals, titleItems };
  }, [rows, selectedComponent]);

  const isChildNode = selectedComponent?.children.length === 0;

  return (
    <>
      {selectedComponent && (
        isChildNode ? (
          <ChildNode
            selectedComponent={selectedComponent}
            rows={rows}
            setRows={setRows}
            unidadMedida={unidadMedida}
            setUnidadMedida={setUnidadMedida}
            rendimiento={rendimiento}
            setRendimiento={setRendimiento}
            rendimientoDias={rendimientoDias}
            setRendimientoDias={setRendimientoDias}
            horas={horas}
            setHoras={setHoras}
            calculateTotals={calculateTotals}
            suggestionsTable={suggestionsTable}
            toast={toast}
          />
        ) : (
          <ParentNode
            selectedComponent={selectedComponent}
            calculateTotals={calculateTotals}
          />
        )
      )}
    </>
  );
};

export default TablaSheet;