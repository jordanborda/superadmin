
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
  };
}

export const withAuth = (handler: NextApiHandler) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('No token provided');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
};
