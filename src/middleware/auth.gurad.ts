// src/middleware/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../modules/auth/auth.service';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      // No token - silent fail
      return true;
    }

    try {
      const decoded = this.authService.verifyToken(token);
      req.user = decoded;
      return true;
    } catch (error) {
      // Only log unexpected errors
      if (!(error instanceof JsonWebTokenError) && 
          !(error instanceof TokenExpiredError)) {
        console.error('Unexpected Auth Guard Error:', error);
      }
      return true;
    }
  }
}