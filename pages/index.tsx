import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    document.title = `${isLogin ? 'Iniciar Sesión' : 'Crear cuenta'} | Tu Empresa`;
  }, [isLogin]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const body = isLogin
        ? JSON.stringify({ email, password })
        : JSON.stringify({ email, password, firstName, lastName });

      console.log(`Enviando solicitud a ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          console.log('Inicio de sesión exitoso. Datos recibidos:', data);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userInfo', JSON.stringify({
            firstName: data.user.firstName,
            role: data.user.role
          }));
          
          console.log('Redirigiendo a /home...');
          await router.push('/home');
          console.log('Redirección completada');
        } else {
          console.log('Registro exitoso');
          toast({
            title: "Registro exitoso",
            description: "Usuario registrado correctamente",
            variant: "success",
          });
          resetForm();
          setIsLogin(true);
        }
      } else {
        console.error('Error en la respuesta:', data.message);
        toast({
          title: "Error",
          description: data.message || 'Error en la operación',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      toast({
        title: "Error",
        description: 'Error en la operación. Por favor, intenta de nuevo.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Autenticación | Tu Empresa</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin ? 'Ingresa a tu cuenta' : 'Regístrate para comenzar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              <Button type="submit" className="w-full">
                {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              </Button>
            </form>
            </CardContent>
          <CardFooter>
            <Button variant="link" onClick={toggleAuthMode} className="w-full" disabled={isLoading}>
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default AuthPage;