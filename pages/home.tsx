import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from './Header';
import Sidebar from './Sidebar';
import AddComponentModal from '../components/AddComponentModal';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Head>
        <title>Dashboard - Mi Aplicación</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bienvenido, {user?.firstName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tu rol actual es: <span className="font-semibold">{user?.role}</span>
              </p>
            </CardContent>
          </Card>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Componentes</h2>
              {(user?.role === 'superadmin' || user?.role === 'admin') && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar componente
                </Button>
              )}
            </div>
            
            {components.length > 0 ? (
              <div>
                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                  {components.map((component) => (
                    <Button
                      key={component.id}
                      variant={activeTab === component.id ? "default" : "outline"}
                      onClick={() => setActiveTab(component.id)}
                      className="whitespace-nowrap"
                    >
                      {component.name}
                    </Button>
                  ))}
                </div>
                {activeTab && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{components.find(c => c.id === activeTab)?.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {components.find(c => c.id === activeTab)?.content}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-6">
                  <p className="text-muted-foreground">No hay componentes añadidos aún.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <AddComponentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddComponent}
            generateId={generateComponentId}
          />
        </main>
      </div>
    </div>
  );
};

export default Home;