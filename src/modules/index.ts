// src/modules/index.ts
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductModule } from './product/product.module';

export const featureModules = [
  AuthModule,
  RoleModule,
  UserModule,
  CategoryModule,
  BrandModule,
  ProductModule,
];

export {
  AuthModule,
  RoleModule,
  UserModule,
  CategoryModule,
  BrandModule,
  ProductModule,
};
