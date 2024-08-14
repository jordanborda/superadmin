import React, { useState } from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <h2 className="text-2xl font-semibold mb-5">Dashboard</h2>
      <ul>
        <li className="mb-2">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            Procesos Físicos
            <svg 
              className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && (
            <ul className="pl-4 mt-2">
              <li className="mb-2"><Link href="/metrado-diario">Metrado Diario</Link></li>
              <li className="mb-2"><Link href="/historial-metrado">Historial de Metrado</Link></li>
              <li className="mb-2"><Link href="/cuadro-metrados">Cuadro de Metrados</Link></li>
              <li className="mb-2"><Link href="/valorizacion">Valorización</Link></li>
              <li className="mb-2"><Link href="/recursos">Recursos</Link></li>
              <li className="mb-2"><Link href="/historial-imagenes">Historial Imágenes</Link></li>
            </ul>
          )}
        </li>
        {/* Aquí puedes añadir más elementos al menú principal si es necesario */}
      </ul>
    </div>
  );
};

export default Sidebar;