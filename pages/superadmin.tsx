import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTable } from 'react-table';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
}

const SuperAdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      setError('Error fetching users. Please try again.');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch('/api/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId, newRole })
      });
      if (response.ok) {
        fetchUsers(); // Recargar la lista de usuarios
      } else {
        throw new Error('Failed to change user role');
      }
    } catch (error) {
      setError('Error changing user role. Please try again.');
      console.error('Error changing user role:', error);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Nombre',
        accessor: 'firstName',
      },
      {
        Header: 'Apellido',
        accessor: 'lastName',
      },
      {
        Header: 'Rol',
        accessor: 'role',
        Cell: ({ row }: { row: any }) => (
          <select
            value={row.original.role}
            onChange={(e) => handleRoleChange(row.original.id, e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="visitante">Visitante</option>
          </select>
        ),
      },
      {
        Header: 'Creado',
        accessor: 'createdAt',
        Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Último Login',
        accessor: 'lastLogin',
        Cell: ({ value }: { value: string }) => value ? new Date(value).toLocaleString() : 'N/A',
      },
      {
        Header: 'Activo',
        accessor: 'isActive',
        Cell: ({ value }: { value: boolean }) => value ? 'Sí' : 'No',
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: users });

  const roleData = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(roleData).map(([role, count]) => ({ role, count }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Panel de Superadmin</title>
      </Head>
      <h1 className="text-3xl font-bold mb-8">Panel de Administración de Usuarios</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Distribución de Roles</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="role" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Lista de Usuarios</h2>
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full bg-white">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()} className="py-2 px-4 border-b">
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row)
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => {
                      return (
                        <td {...cell.getCellProps()} className="py-2 px-4 border-b">
                          {cell.render('Cell')}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;