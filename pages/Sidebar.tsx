import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@radix-ui/react-switch';
import { FaHardHat, FaHistory, FaChartBar, FaDollarSign, FaTools, FaImages } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-gray-900 text-white w-64 min-h-screen p-4 shadow-lg">
      <h2 className="text-2xl font-semibold mb-5 flex items-center">
        <FaHardHat className="mr-2 text-yellow-500" size={28} />
        Dashboard
      </h2>
      <ul>
        <li className="mb-2">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-left text-white hover:bg-yellow-500 rounded-md py-2 px-4"
          >
            <span className="flex items-center">
              <FaHardHat className="mr-2 bg-white text-gray-900 rounded-full p-1" size={24} />
              Procesos Físicos
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          {isOpen && (
            <ul className="pl-8 mt-2 space-y-2">
              <li>
                <Link href="/procesos-fisicos/metrado-diario">
                  <Button variant="link" className="text-white flex items-center hover:text-yellow-500">
                    <FaChartBar className="mr-2 bg-white text-gray-900 rounded-full p-1" size={20} />
                    Metrado Diario
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/historial-metrado">
                  <Button variant="link" className="text-white flex items-center hover:text-yellow-500">
                    <FaHistory className="mr-2 bg-white text-gray-900 rounded-full p-1" size={20} />
                    Historial de Metrado
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/cuadro-metrados">
                  <Button variant="link" className="text-white flex items-center hover:text-yellow-500">
                    <FaChartBar className="mr-2 bg-white text-gray-900 rounded-full p-1" size={20} />
                    Cuadro de Metrados  
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/valorizacion">
                  <Button variant="link" className="text-white flex items-center hover:text-yellow-500">
                    <FaDollarSign className="mr-2 bg-white text-gray-900 rounded-full p-1" size={20} />
                    Valorización
                  </Button>  
                </Link>
              </li>
              <li>
                <Link href="/recursos">
                  <Button variant="link" className="text-white flex items-center hover:text-yellow-500">
                    <FaTools className="mr-2 bg-white text-gray-900 rounded-full p-1" size={20} /> 
                    Recursos
                  </Button>
                </Link>  
              </li>
              <li>
                <Link href="/historial-imagenes">  
                  <Button variant="link" className="text-white flex items-center hover:text-yellow-500">
                    <FaImages className="mr-2 bg-white text-gray-900 rounded-full p-1" size={20} />
                    Historial Imágenes  
                  </Button>
                </Link>
              </li>
            </ul>
          )}
        </li>  
      </ul>

      <div className="mt-8">
        <Switch label="Modo Oscuro" checked />  
      </div>
    </Card>
  );
};

export default Sidebar;