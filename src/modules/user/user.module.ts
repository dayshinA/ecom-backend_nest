// src/modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { UserResolver } from '../../graphql/resolvers/user.resolver';
import User from '../../models/user.model';
import Role from '../../models/role.model';
import SellerProfile from '../../models/seller.model';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../../config/cloudinary.module'; // Import CloudinaryModule

@Module({
  imports: [
    SequelizeModule.forFeature([User, Role, SellerProfile]),
    AuthModule,
    CloudinaryModule, // Add CloudinaryModule here
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
