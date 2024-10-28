// src/modules/brand/brand.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BrandService } from './brand.service';
import { BrandResolver } from '../../graphql/resolvers/brand.resolver';
import Brand from '../../models/brand.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Brand]), AuthModule],
  providers: [BrandService, BrandResolver],
  exports: [BrandService],
})
export class BrandModule {}
