// src/modules/index.ts
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';

export const featureModules = [
  AuthModule,
  RoleModule,
  UserModule,
  CategoryModule,
];

export { AuthModule, RoleModule, UserModule, CategoryModule };
