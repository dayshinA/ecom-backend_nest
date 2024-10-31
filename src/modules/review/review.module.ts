// src/modules/review/review.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReviewService } from './review.service';
import { ReviewResolver } from '../../graphql/resolvers/review.resolver';
import Review from '../../models/review.model';
import User from '../../models/user.model';
import Product from '../../models/product.model';
import Role from '../../models/role.model';
import Category from '../../models/category.model';
import Brand from '../../models/brand.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Review, User, Product, Role, Category, Brand]),
    AuthModule,
  ],
  providers: [ReviewService, ReviewResolver],
  exports: [ReviewService],
})
export class ReviewModule {}
