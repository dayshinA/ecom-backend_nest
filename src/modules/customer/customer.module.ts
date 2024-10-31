// src/modules/customer/customer.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomerService } from './customer.service';
import { CustomerResolver } from '../../graphql/resolvers/customer.resolver';
import Order from '../../models/order.model';
import OrderDetail from '../../models/order_detail.model';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import ShippingAddress from '../../models/shippingAddress.model';
import Payment from '../../models/payment.model';
import PaymentMethod from '../../models/paymentMethod.model';
import OrderStatus from '../../models/orderStatus.model';
import User from '../../models/user.model';
import SellerProfile from '../../models/seller.model';
import { AuthModule } from '../auth/auth.module';
import { ShippingAddressService } from '../shippingAddress/shippingAddress.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Order,
      OrderDetail,
      Product,
      ProductVariation,
      ShippingAddress,
      Payment,
      PaymentMethod,
      OrderStatus,
      User,
      SellerProfile,
    ]),
    AuthModule,
  ],
  providers: [CustomerService, ShippingAddressService, CustomerResolver],
  exports: [CustomerService, ShippingAddressService],
})
export class CustomerModule {}
