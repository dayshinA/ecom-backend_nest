// src/modules/product/product.module.ts
// src/modules/product/product.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductService } from './product.service';
import { ProductResolver } from '../../graphql/resolvers/product.resolver';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import Category from '../../models/category.model';
import Brand from '../../models/brand.model';
import User from '../../models/user.model';
import SellerProfile from '../../models/seller.model';
import SellerInventory from '../../models/sellerInventory.model';
import { CloudinaryModule } from '../../config/cloudinary.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Product,
      ProductVariation,
      Category,
      Brand,
      User,
      SellerProfile,
      SellerInventory,
    ]),
    AuthModule,
    CloudinaryModule,
  ],
  providers: [ProductService, ProductResolver],
  exports: [ProductService],
})
export class ProductModule {}
