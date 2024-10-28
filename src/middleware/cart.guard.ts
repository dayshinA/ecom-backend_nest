// src/middleware/cart.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../modules/auth/auth.service';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class CartGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    // Handle authenticated users
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = this.authService.verifyToken(token);
        req.user = {
          user_id: decoded.user_id,
          user_name: decoded.user_name,
          role: decoded.role,
          is_seller: decoded.is_seller,
        };
      } catch (error) {
        // Only log unexpected errors
        if (
          !(error instanceof JsonWebTokenError) &&
          !(error instanceof TokenExpiredError)
        ) {
          console.error('Unexpected Cart Guard Error:', error);
        }
        // If token is invalid, continue as guest user
      }
    }

    // If no user is set (either no token or invalid token), use session ID
    if (!req.user) {
      req.sessionId = req.sessionID;
    }

    return true;
  }
}
