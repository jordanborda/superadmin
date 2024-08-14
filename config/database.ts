// config/database.ts
import sql from 'mssql';

const config: sql.config = {
  user: 'jordanazure',
  password: process.env.DB_PASSWORD,
  server: 'azureobra.database.windows.net',
  database: 'proyecto-obra',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

export async function getConnection() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    throw err;
  }
}