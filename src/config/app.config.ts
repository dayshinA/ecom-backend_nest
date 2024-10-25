// src/config/app.config.ts
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AppConfig {
  static JWT_SECRET: string = process.env.JWT_SECRET || 'dayTillerr123';
}
