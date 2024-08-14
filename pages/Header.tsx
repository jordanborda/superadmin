import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface User {
  firstName: string;
  role: string;
}

const Header: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  useEffect(() => {
    console.log('Header mounting');
    const userInfo = localStorage.getItem('userInfo');
    console.log('UserInfo from localStorage:', userInfo);
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      console.log('Parsed user:', parsedUser);
      setUser(parsedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    router.push('/');
  };

  if (!user) {
    return null; // No renderizar nada si no hay información del usuario
  }

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mi Aplicación</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-semibold">{user.firstName}</span>
          {user.role === 'superadmin' ? (
            <Link href="/superadmin" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
              {user.role} 
                
            </Link>
          ) : (
            <span className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded">
              {user.role}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;