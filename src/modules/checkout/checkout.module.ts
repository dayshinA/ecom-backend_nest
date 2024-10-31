// src/modules/checkout/checkout.module.ts
// src/modules/checkout/checkout.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CheckoutService } from './checkout.service';
import { CheckoutResolver } from '../../graphql/resolvers/checkout.resolver';
import Cart from '../../models/cart.model';
import CartItem from '../../models/cartItem.model';
import Order from '../../models/order.model';
import OrderDetail from '../../models/order_detail.model';
import ShippingAddress from '../../models/shippingAddress.model';
import Payment from '../../models/payment.model';
import PaymentMethod from '../../models/paymentMethod.model';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import SellerProfile from '../../models/seller.model';
import SellerInventory from '../../models/sellerInventory.model';
import { PaymentService } from '../payment/payment.service';
import { AuthModule } from '../auth/auth.module';
import { PaymentMethodService } from '../paymentMethod/paymentMethod.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Cart,
      CartItem,
      Order,
      OrderDetail,
      ShippingAddress,
      Payment,
      PaymentMethod,
      Product,
      ProductVariation,
      SellerProfile,
      SellerInventory,
    ]),
    AuthModule,
  ],
  providers: [
    CheckoutService,
    CheckoutResolver,
    PaymentService,
    PaymentMethodService,
  ],
  exports: [CheckoutService, PaymentService, PaymentMethodService],
})
export class CheckoutModule {}
