// src/modules/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CartService } from './cart.service';
import { CartResolver } from '../../graphql/resolvers/cart.resolver';
import Cart from '../../models/cart.model';
import CartItem from '../../models/cartItem.model';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import { AuthModule } from '../auth/auth.module';
import SellerInventory from '../../models/sellerInventory.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Cart,
      CartItem,
      Product,
      ProductVariation,
      SellerInventory,
    ]),
    AuthModule,
  ],
  providers: [CartService, CartResolver],
  exports: [CartService],
})
export class CartModule {}
