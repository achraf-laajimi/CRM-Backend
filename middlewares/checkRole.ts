import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  role: string;
}

// Middleware pour vérifier les rôles
const checkRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "omar_bo3" as string) as JwtPayload;
      const userRole = decoded.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: ' You dont have the right role' });
      }

      // Ajouter les informations de l'utilisateur à la requête
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

export default checkRole;
