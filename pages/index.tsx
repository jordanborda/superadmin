import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return <>{children}</>;
};

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const router = useRouter();

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
          
          alert('Inicio de sesión exitoso');
          console.log('Redirigiendo a /home...');
          
          // Usar router.push con una promesa para asegurar la redirección
          await router.push('/home');
          console.log('Redirección completada');
        } else {
          console.log('Registro exitoso');
          alert('Usuario registrado exitosamente');
          resetForm();
          setIsLogin(true);
        }
      } else {
        console.error('Error en la respuesta:', data.message);
        alert(data.message || 'Error en la operación');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error en la operación. Por favor, intenta de nuevo.');
    }
  };
  

  return (
    <>

        <title>Autenticación | Tu Empresa</title>
        <link rel="icon" href="/favicon.ico" />

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <ClientOnly>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img className="mx-auto h-12 w-auto" src="/vercel.svg" alt="Tu Logo" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta'}
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <div className="mt-1">
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          autoComplete="given-name"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Apellido
                      </label>
                      <div className="mt-1">
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {isLogin ? '¿Nuevo en nuestra plataforma?' : '¿Ya tienes una cuenta?'}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={toggleAuthMode}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50"
                  >
                    {isLogin ? 'Crear una nueva cuenta' : 'Iniciar sesión'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
    </>
  );
};

export default AuthPage;