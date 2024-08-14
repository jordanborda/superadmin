import { NextApiRequest, NextApiResponse } from 'next';
import { withRole } from '../../middleware/authMiddleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ message: 'Acceso permitido', user: req.user });
};

export default withRole(['superadmin', 'admin'])(handler);