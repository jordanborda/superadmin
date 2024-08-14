import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../config/database';
import bcrypt from 'bcrypt';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    const pool = await getConnection();

    // Verificar si el email ya existe
    const checkUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT TOP 1 1 FROM Users WHERE Email = @email');
    
    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario con rol por defecto 'visitante'
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('role', sql.NVarChar, 'visitante')
      .query(`
        INSERT INTO Users (Email, PasswordHash, FirstName, LastName, CreatedAt, IsActive, Role)
        VALUES (@email, @passwordHash, @firstName, @lastName, GETDATE(), 1, @role);
        SELECT SCOPE_IDENTITY() AS Id;
      `);

    const newUserId = result.recordset[0].Id;

    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: newUserId });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}