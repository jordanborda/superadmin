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
    console.log('Intentando conectar a la base de datos...');
    const pool = await sql.connect(config);
    console.log('Conexión a la base de datos establecida');
    return pool;
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    throw new Error(`Error de conexión a la base de datos: ${err.message}`);
  }
}