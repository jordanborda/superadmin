import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from './Header';
import Sidebar from './Sidebar';
import ComponentTabs from '../components/ComponentTabs';
import AddComponentModal from '../components/AddComponentModal';

interface Component {
  id: string;
  name: string;
  content: string;
}

interface User {
  firstName: string;
  role: string;
}

const Home: React.FC = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');

      if (!token || !userInfo) {
        console.log('No se encontró token o información de usuario, redirigiendo a login...');
        router.push('/');
      } else {
        setUser(JSON.parse(userInfo));
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleAddComponent = (newComponent: Component) => {
    setComponents([...components, newComponent]);
    setActiveTab(newComponent.id);
    setIsModalOpen(false);
  };

  const generateComponentId = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = alphabet[components.length % alphabet.length];
    const number = Math.floor(components.length / alphabet.length) + 1;
    return `${letter}${number}`;
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Head>
        <title>Dashboard - Mi Aplicación</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Bienvenido, {user?.firstName}
            </h1>
            <div className="flex items-center mb-4">
              <ComponentTabs
                components={components}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              {(user?.role === 'superadmin' || user?.role === 'admin') && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  + Agregar componente
                </button>
              )}
            </div>
            {activeTab && (
              <div className="bg-white p-6 rounded-lg shadow">
                {components.find(c => c.id === activeTab)?.content || 'Contenido del componente'}
              </div>
            )}
            <AddComponentModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAdd={handleAddComponent}
              generateId={generateComponentId}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;