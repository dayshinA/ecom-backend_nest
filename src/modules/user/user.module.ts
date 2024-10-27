// src/modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { UserResolver } from '../../graphql/resolvers/user.resolver';
import User from '../../models/user.model';
import Role from '../../models/role.model';
import SellerProfile from '../../models/seller.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Role, SellerProfile]), // Include all models needed
    AuthModule
  ],
  providers: [UserService, UserResolver],
  exports: [UserService], // Export UserService if other modules need it
})
export class UserModule {}
