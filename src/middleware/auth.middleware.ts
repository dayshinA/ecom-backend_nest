// src/middleware/auth.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });

        req['user'] = {
          user_id: decoded.user_id,
          user_name: decoded.user_name,
          role: decoded.role,
          is_seller: decoded.is_seller,
        };
      } catch (err) {
        console.error('Error verifying token:', err);
      }
    }

    next();
  }
}
