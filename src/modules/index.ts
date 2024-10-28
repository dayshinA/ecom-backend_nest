// src/modules/index.ts
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';

export const featureModules = [
  AuthModule,
  RoleModule,
  UserModule,
  CategoryModule,
  BrandModule,
];

export { AuthModule, RoleModule, UserModule, CategoryModule, BrandModule };
