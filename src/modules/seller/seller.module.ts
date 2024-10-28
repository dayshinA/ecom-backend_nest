// src/modules/seller/seller.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SellerService } from './seller.service';
import { SellerResolver } from '../../graphql/resolvers/seller.resolver';
import SellerProfile from '../../models/seller.model';
import User from '../../models/user.model';
import Role from '../../models/role.model';
import Order from '../../models/order.model';
import OrderDetail from '../../models/order_detail.model';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import ShippingAddress from '../../models/shippingAddress.model';
import Payment from '../../models/payment.model';
import PaymentMethod from '../../models/paymentMethod.model';
import OrderStatus from '../../models/orderStatus.model';
import { CloudinaryModule } from '../../config/cloudinary.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SellerProfile,
      User,
      Role,
      Order,
      OrderDetail,
      Product,
      ProductVariation,
      ShippingAddress,
      Payment,
      PaymentMethod,
      OrderStatus,
    ]),
    CloudinaryModule,
    AuthModule,
  ],
  providers: [SellerService, SellerResolver],
  exports: [SellerService],
})
export class SellerModule {}
