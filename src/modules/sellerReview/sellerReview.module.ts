// src/modules/sellerReview/sellerReview.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SellerReviewService } from './sellerReview.service';
import { SellerReviewResolver } from '../../graphql/resolvers/sellerReview.resolver';
import SellerReview from '../../models/sellerReview.model';
import User from '../../models/user.model';
import SellerProfile from '../../models/seller.model';
import Role from '../../models/role.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([SellerReview, User, SellerProfile, Role]),
    AuthModule,
  ],
  providers: [SellerReviewService, SellerReviewResolver],
  exports: [SellerReviewService],
})
export class SellerReviewModule {}
