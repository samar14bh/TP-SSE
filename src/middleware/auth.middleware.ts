import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    
    const token = req.headers['auth-user'] as string;


    /*if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }*/
    console.log('Token:', token); 

    try {
      const decoded = jwt.verify(token, 'SECRET_KEY') as { userId:   string };
      console.log('Decoded token:', decoded); 
      if (!decoded || !decoded.userId) {
        console.log('Invalid token structure'); 
        return res.status(403).json({ message: 'Token invalide' });
      }
      console.log('User ID from token:', decoded.userId); 
      (req as any).userId = decoded.userId;
      next();
    } catch (err) {
      console.error('Token verification error:', err); 
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  }
}
