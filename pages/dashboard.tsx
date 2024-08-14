// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido a tu dashboard</p>
    </div>
  );
};

export default Dashboard;