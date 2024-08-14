import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.Id, email: user.Email, role: user.Role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Actualizar LastLogin
    await pool.request()
      .input('id', sql.Int, user.Id)
      .query('UPDATE Users SET LastLogin = GETDATE() WHERE Id = @id');

    res.status(200).json({ 
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.Id,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName,
        role: user.Role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}