import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronDown, Trash2, Tag, Search } from "lucide-react";
import { suggestionsDatabase } from '../utils/suggestionsDatabase';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Component {
  id: string;
  name: string;
  children: Component[];
  isPartida: boolean;
  color: string;
}

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (components: Component[]) => void;
  existingComponents: Component[];
}

const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

const AddComponentModal: React.FC<AddComponentModalProps> = ({ isOpen, onClose, onAdd, existingComponents }) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Component[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [showSearchAlert, setShowSearchAlert] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setComponents(existingComponents);
    }
  }, [isOpen, existingComponents]);

  const generateId = (parentId?: string): string => {
    if (!parentId) {
      return `${components.length + 1}`;
    }
    const parentParts = parentId.split('.');
    const siblings = findComponentById(components, parentId)?.children || [];
    return `${parentId}.${siblings.length + 1}`;
  };

  const findComponentById = (components: Component[], id: string): Component | undefined => {
    for (let component of components) {
      if (component.id === id) {
        return component;
      }
      const found = findComponentById(component.children, id);
      if (found) {
        return found;
      }
    }
    return undefined;
  };

  const addComponent = (parentId?: string) => {
    const parent = parentId ? findComponentById(components, parentId) : null;
    if (parent && parent.isPartida) return;

    const newId = generateId(parentId);
    const depth = newId.split('.').length - 1;
    const color = getColorByDepth(depth);
    
    const newComponent: Component = {
      id: newId,
      name: '',
      children: [],
      isPartida: false,
      color: color,
    };

    setComponents(prevComponents => {
      const updateComponents = (components: Component[]): Component[] => {
        return components.map(comp => {
          if (comp.id === parentId) {
            return { ...comp, children: [...comp.children, newComponent] };
          } else if (comp.children.length > 0) {
            return { ...comp, children: updateComponents(comp.children) };
          }
          return comp;
        });
      };

      if (parentId) {
        return updateComponents(prevComponents);
      } else {
        return [...prevComponents, newComponent];
      }
    });
  };

  const getSuggestions = (id: string, input: string) => {
    const depth = id.split('.').length;
    let suggestionList: string[];

    if (depth === 1) {
      suggestionList = suggestionsDatabase.firstGeneration;
    } else if (depth === 2) {
      suggestionList = suggestionsDatabase.secondGeneration;
    } else if (depth === 3) {
      suggestionList = suggestionsDatabase.thirdGeneration;
    } else {
      suggestionList = suggestionsDatabase.general;
    }

    return suggestionList.filter(suggestion => 
      suggestion.toLowerCase().includes(input.toLowerCase())
    );
  };

  const handleComponentNameChange = (id: string, name: string) => {
    const upperCaseName = name.toUpperCase();
    setComponents(prevComponents => {
      const updateName = (components: Component[]): Component[] => {
        return components.map(comp => {
          if (comp.id === id) {
            return { ...comp, name: upperCaseName };
          } else if (comp.children.length > 0) {
            return { ...comp, children: updateName(comp.children) };
          }
          return comp;
        });
      };
      return updateName(prevComponents);
    });

    setSuggestions(getSuggestions(id, upperCaseName));
    setActiveComponentId(id);
  };

  const applySuggestion = (id: string, suggestion: string) => {
    handleComponentNameChange(id, suggestion);
    setSuggestions([]);
    setActiveComponentId(null);
  };
  
  const handleSubmit = () => {
    onAdd(components);
    setComponents([]);
    onClose();
  };

  const handleClose = () => {
    if (components.length > 0) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = (confirm: boolean) => {
    setShowConfirmation(false);
    if (confirm) {
      setComponents([]);
      onClose();
    }
  };

  const getColorByDepth = (depth: number) => {
    return colors[depth % colors.length];
  };

  const deleteComponent = (id: string) => {
    setComponents(prevComponents => {
      const deleteFromComponents = (components: Component[]): Component[] => {
        return components.filter(comp => {
          if (comp.id === id) {
            return false;
          }
          if (comp.children.length > 0) {
            comp.children = deleteFromComponents(comp.children);
          }
          return true;
        });
      };
      return deleteFromComponents(prevComponents);
    });
    setShowDeleteConfirmation(null);
  };

  const togglePartida = (id: string) => {
    setComponents(prevComponents => {
      const togglePartidaInComponents = (components: Component[]): Component[] => {
        return components.map(comp => {
          if (comp.id === id) {
            return { ...comp, isPartida: !comp.isPartida, children: [] };
          }
          if (comp.children.length > 0) {
            return { ...comp, children: togglePartidaInComponents(comp.children) };
          }
          return comp;
        });
      };
      return togglePartidaInComponents(prevComponents);
    });
  };

  const handleSearch = () => {
    if (!searchTerm) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }

    const results = components.flatMap(component => 
      findComponentsByName(component, searchTerm.toUpperCase())
    );

    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
    setShowSearchAlert(results.length > 1);

    if (results.length > 0) {
      highlightAndScrollToComponent(results[0].id);
    }
  };

  const highlightAndScrollToComponent = (componentId: string) => {
    setHighlightedComponent(componentId);
    scrollToComponent(componentId);
    setTimeout(() => setHighlightedComponent(null), 2000); // Remove highlight after 2 seconds
  };


  const findComponentsByName = (component: Component, name: string): Component[] => {
    let results: Component[] = [];
    if (component.name.includes(name)) {
      results.push(component);
    }
    component.children.forEach(child => {
      results = results.concat(findComponentsByName(child, name));
    });
    return results;
  };

  const scrollToComponent = (componentId: string) => {
    const element = document.getElementById(componentId);
    if (element && contentRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      if (searchResults.length > 0) {
        const newIndex = (currentResultIndex + 1) % searchResults.length;
        setCurrentResultIndex(newIndex);
        highlightAndScrollToComponent(searchResults[newIndex].id);
      } else {
        handleSearch();
      }
    }
  };

  const getSearchSuggestions = (input: string) => {
    const allSuggestions = [
      ...suggestionsDatabase.firstGeneration,
      ...suggestionsDatabase.secondGeneration,
      ...suggestionsDatabase.thirdGeneration,
      ...suggestionsDatabase.general
    ];
    return allSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(input.toLowerCase())
    );
  };

  
  const renderTreeItem = (component: Component, depth = 0) => (
    <div 
      key={component.id} 
      id={component.id}
      className={`ml-4 mt-2 ${highlightedComponent === component.id ? 'animate-pulse bg-yellow-200 dark:bg-yellow-800' : ''}`}
    >
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className={`${component.color} text-white`}>
          {component.id}
        </Badge>
        <div className="relative flex-grow">
          <Input
            value={component.name}
            onChange={(e) => handleComponentNameChange(component.id, e.target.value)}
            placeholder="NOMBRE DEL COMPONENTE"
            className="uppercase w-full"
          />
          {suggestions.length > 0 && activeComponentId === component.id && (
            <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 mt-1 max-h-40 overflow-auto rounded-md shadow-lg">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-3 py-1 hover:bg-gray-700 cursor-pointer text-white text-sm"
                  onClick={() => applySuggestion(component.id, suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        {!component.isPartida && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addComponent(component.id)}
            className="p-1"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteConfirmation(component.id)}
          className="p-1"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePartida(component.id)}
          className={`p-1 ${component.isPartida ? 'bg-orange-500 text-white' : ''}`}
        >
          <Tag className="h-4 w-4" />
        </Button>
        {component.isPartida && (
          <Badge variant="secondary" className="bg-orange-500 text-white">
            Partida
          </Badge>
        )}
      </div>
      {component.children.map((child) => renderTreeItem(child, depth + 1))}
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl w-full min-h-[10rem] max-h-[80vh]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle>Agregar Nuevos Componentes</DialogTitle>
              <DialogDescription>
                Ingrese los nombres de los nuevos componentes.
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar componente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-64"
                />
                {searchTerm && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
                    {getSearchSuggestions(searchTerm).map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setSearchTerm(suggestion);
                          handleSearch();
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {showSearchAlert && (
            <Alert>
              <AlertDescription>
                Hay {searchResults.length} títulos iguales. Presione Enter para navegar entre ellos.
              </AlertDescription>
            </Alert>
          )}
          <div ref={contentRef} className="py-4 min-h-[10rem] max-h-[60vh] overflow-y-auto">
            {components.map((component) => renderTreeItem(component))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={() => addComponent()}>
              Agregar Componente
            </Button>
            <Button onClick={handleSubmit}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Tiene cambios sin guardar. ¿Está seguro de que desea cerrar sin guardar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleConfirmClose(false)}>No, Quedarse</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmClose(true)}>Sí, Cerrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!showDeleteConfirmation} onOpenChange={() => setShowDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar este componente y todos sus hijos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirmation(null)}>No, Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => showDeleteConfirmation && deleteComponent(showDeleteConfirmation)}>Sí, Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddComponentModal;