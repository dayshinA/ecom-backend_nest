// src/modules/admin/admin.module.ts
// src/modules/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminService } from './admin.service';
import { AdminResolver } from '../../graphql/resolvers/admin.resolver';
import User from '../../models/user.model';
import Role from '../../models/role.model';
import SellerProfile from '../../models/seller.model';
import Order from '../../models/order.model';
import OrderDetail from '../../models/order_detail.model';
import Category from '../../models/category.model';
import Brand from '../../models/brand.model';
import OrderStatus from '../../models/orderStatus.model';
import ShippingAddress from '../../models/shippingAddress.model';
import Payment from '../../models/payment.model';
import PaymentMethod from '../../models/paymentMethod.model';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Role,
      SellerProfile,
      Order,
      OrderDetail,
      Category,
      Brand,
      OrderStatus,
      ShippingAddress,
      Payment,
      PaymentMethod,
      Product,
      ProductVariation,
    ]),
    AuthModule,
  ],
  providers: [AdminService, AdminResolver],
  exports: [AdminService],
})
export class AdminModule {}
