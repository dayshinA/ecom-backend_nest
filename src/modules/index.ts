// src/modules/index.ts
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductModule } from './product/product.module';
import { SellerModule } from './seller/seller.module';
import { AdminModule } from './admin/admin.module';
import { CartModule } from './cart/cart.module';
import { CustomerModule } from './customer/customer.module';
import { CheckoutModule } from './checkout/checkout.module';
import { ReviewModule } from './review/review.module';
import { SellerReviewModule } from './sellerReview/sellerReview.module';

export const featureModules = [
  AuthModule,
  RoleModule,
  UserModule,
  CategoryModule,
  BrandModule,
  ProductModule,
  SellerModule,
  AdminModule,
  CartModule,
  CustomerModule,
  CheckoutModule,
  ReviewModule,
  SellerReviewModule,
];

export {
  AuthModule,
  RoleModule,
  UserModule,
  CategoryModule,
  BrandModule,
  ProductModule,
  SellerModule,
  AdminModule,
  CartModule,
  CustomerModule,
  CheckoutModule,
  ReviewModule,
  SellerReviewModule,
};
