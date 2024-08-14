import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

export function withAuth(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      console.error('Error en la autenticación:', error);
      return res.status(401).json({ message: 'Token inválido', error: error.message });
    }
  };
}

export function withRole(roles: string[]) {
  return (handler: any) => {
    return withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
      }
      return handler(req, res);
    });
  };
}