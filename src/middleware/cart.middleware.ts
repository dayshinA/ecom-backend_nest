// src/middleware/cart.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class CartMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req['user'] = {
          user_id: decoded['user_id'],
          user_name: decoded['user_name'],
          role: decoded['role'],
          is_seller: decoded['is_seller'],
        };
      } catch (err) {
        console.error('Error verifying token:', err);
      }
    }

    // If no user is set (either no token or invalid token), set the session ID as fallback
    if (!req['user']) {
      req['sessionId'] = req.sessionID;
    }

    next();
  }
}
