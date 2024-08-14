import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from "../components/ui/button";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface User {
  firstName: string;
  role: string;
}

const Header: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <header className="border-b">
      <div className="container mx-auto py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mi Aplicación</h1>
        <div className="flex items-center space-x-4">
          <span className="font-semibold">{user.firstName}</span>
          {user.role === 'superadmin' ? (
            <Link href="/superadmin" passHref>
              <Button variant="outline">{user.role}</Button>
            </Link>
          ) : (
            <Button variant="outline" disabled>{user.role}</Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;