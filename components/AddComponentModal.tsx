import React, { useState } from 'react';

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (component: { id: string; name: string; content: string }) => void;
  generateId: () => string;
}

const AddComponentModal: React.FC<AddComponentModalProps> = ({ isOpen, onClose, onAdd, generateId }) => {
  const [componentName, setComponentName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (componentName.trim()) {
      const newId = generateId();
      onAdd({ id: newId, name: componentName, content: `Contenido del componente ${componentName}` });
      setComponentName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Agregar nuevo componente</h3>
          <form onSubmit={handleSubmit} className="mt-2 px-7 py-3">
            <input
              type="text"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="Nombre del componente"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="items-center px-4 py-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-4 mr-5 text-gray-400 hover:text-gray-600"
        >
          <span className="text-2xl">&times;</span>
        </button>
      </div>
    </div>
  );
};

export default AddComponentModal;