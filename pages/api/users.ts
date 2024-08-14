import { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../config/database';
import { withRole } from '../../middleware/authMiddleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT Id, Email, FirstName, LastName, Role, CreatedAt, LastLogin, IsActive 
      FROM Users
    `);
    res.status(200).json({ users: result.recordset });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export default withRole(['superadmin'])(handler);