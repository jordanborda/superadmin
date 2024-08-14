import { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../config/database';
import { withRole } from '../../middleware/authMiddleware';
import sql from 'mssql';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, newRole } = req.body;

  if (!userId || !newRole) {
    return res.status(400).json({ message: 'UserId y newRole son requeridos' });
  }

  if (!['superadmin', 'admin', 'visitante'].includes(newRole)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  try {
    const pool = await getConnection();
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('newRole', sql.NVarChar, newRole)
      .query('UPDATE Users SET Role = @newRole WHERE Id = @userId');

    res.status(200).json({ message: 'Rol actualizado exitosamente' });
  } catch (error) {
    console.error('Error al cambiar el rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export default withRole(['superadmin'])(handler);