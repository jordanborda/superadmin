import { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../config/database';
import { withRole } from '../../middleware/authMiddleware';
import sql from 'mssql';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        Id,
        Email,
        FirstName,
        LastName,
        CreatedAt,
        LastLogin,
        CAST(IsActive AS BIT) AS IsActive,
        Role
      FROM Users
    `);

    const users = result.recordset.map(user => ({
      id: user.Id,
      email: user.Email,
      firstName: user.FirstName,
      lastName: user.LastName,
      createdAt: user.CreatedAt ? user.CreatedAt.toISOString() : null,
      lastLogin: user.LastLogin ? user.LastLogin.toISOString() : null,
      isActive: Boolean(user.IsActive),
      role: user.Role
    }));

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

export default withRole(['superadmin'])(handler);