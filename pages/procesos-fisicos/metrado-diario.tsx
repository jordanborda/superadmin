import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import TablaSheet from '@/components/tabla-sheet';

interface Component {
  id: string;
  name: string;
  children: Component[];
  isRegistered: boolean;
  color: string;
}

const MetradoDiarioPage: React.FC = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const { toast } = useToast();

  const loadComponents = useCallback(() => {
    try {
      const savedComponents = localStorage.getItem('components');
      if (savedComponents) {
        const parsedComponents = JSON.parse(savedComponents);
        setComponents(parsedComponents);
      } else {
        console.warn('No components found in localStorage');
        setComponents([]);
      }
    } catch (error) {
      console.error('Error loading components:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los componentes. Por favor, intente de nuevo.",
        variant: "destructive",
      });
      setComponents([]);
    }
  }, [toast]);

  useEffect(() => {
    loadComponents();
  }, [loadComponents]);

  const saveComponents = useCallback((updatedComponents: Component[]) => {
    try {
      localStorage.setItem('components', JSON.stringify(updatedComponents));
    } catch (error) {
      console.error('Error saving components:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleComponentSelect = (component: Component) => {
    if (component.children.length === 0) {
      setSelectedComponent(component);
    }
  };

  const updateComponent = (updatedComponent: Component) => {
    const updateComponentRecursive = (components: Component[]): Component[] => {
      return components.map(comp => {
        if (comp.id === updatedComponent.id) {
          return updatedComponent;
        } else if (comp.children.length > 0) {
          return { ...comp, children: updateComponentRecursive(comp.children) };
        }
        return comp;
      });
    };

    const updatedComponents = updateComponentRecursive(components);
    setComponents(updatedComponents);
    saveComponents(updatedComponents);
    setSelectedComponent(updatedComponent);
  };

  const renderComponent = (component: Component, depth = 0) => (
    <div 
      key={component.id} 
      className={`py-1 ${component.children.length === 0 ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''}`}
      onClick={() => handleComponentSelect(component)}
    >
      <div className="flex items-center space-x-1 text-sm">
        <div style={{ width: `${depth * 12}px` }} /> {/* Reduced indentation */}
        <Badge variant="outline" className={`${component.color} text-white text-xs px-1 py-0`}>
          {component.id}
        </Badge>
        <span className={`flex-grow font-medium truncate ${component.children.length === 0 ? 'text-blue-600 dark:text-blue-400' : ''}`}>
          {component.name}
        </span>
        {component.children.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => toggleCollapse(component.id, e)}
            className="p-0 h-6 w-6"
          >
            {collapsedNodes.has(component.id) ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      {component.children.length > 0 && !collapsedNodes.has(component.id) && (
        <div>
          {component.children.map(child => renderComponent(child, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col sm:flex-row">
            {/* Lista de componentes (lado izquierdo) */}
            <Card className="w-full sm:w-1/3 lg:w-1/4 flex flex-col h-1/3 sm:h-full">
              <CardHeader className="py-2">
                <h2 className="text-lg font-bold">Componentes</h2>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden p-2">
                <ScrollArea className="h-full">
                  {components.map(component => renderComponent(component))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Área de contenido (lado derecho) */}
            <div className="w-full sm:w-2/3 lg:w-3/4 h-2/3 sm:h-full overflow-auto p-4">
              <TablaSheet selectedComponent={selectedComponent} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MetradoDiarioPage;