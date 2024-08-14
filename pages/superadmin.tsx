import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Moon, Sun, BarChart, Home } from "lucide-react";

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    lastLogin: string | null;
    isActive: boolean;
    role: string;
  }

const SuperAdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo || JSON.parse(userInfo).role !== 'superadmin') {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.users)) {
        throw new Error('El formato de los datos recibidos no es correcto');
      }

      setUsers(data.users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError(`Error al obtener usuarios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, newRole })
      });
      if (!response.ok) {
        throw new Error('Failed to change user role');
      }
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error changing user role:', error);
      setError('Error changing user role. Please try again.');
    }
  };

  const roleData = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Panel de Superadmin</title>
      </Head>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/home')}>
            <Home className="mr-2 h-4 w-4" /> Volver al Home
          </Button>
          <div className="flex items-center space-x-2">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        {Object.entries(roleData).map(([role, count]) => (
          <Card key={role}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{role}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Distribución de Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around items-end h-64">
            {Object.entries(roleData).map(([role, count]) => (
              <div key={role} className="flex flex-col items-center">
                <div 
                  className="bg-primary w-16" 
                  style={{ height: `${(count / users.length) * 100}%` }}
                ></div>
                <span className="mt-2">{role}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>Último Login</TableHead>
            <TableHead>Activo</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {users.map((user) => (
            <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>
                <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                >
                    <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="visitante">Visitante</SelectItem>
                    </SelectContent>
                </Select>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</TableCell>
                <TableCell>{user.isActive ? 'Sí' : 'No'}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminPage;