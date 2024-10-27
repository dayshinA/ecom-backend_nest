// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './config/cloudinary.config';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import Role from './models/role.model';
import User from './models/user.model';
import SellerProfile from './models/seller.model';
import { CloudinaryModule } from './config/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [Role, User, SellerProfile], // Include both models
      autoLoadModels: true,
      synchronize: false, // Changed to false for safety
      logging: false,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      csrfPrevention: false,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
    }),

    AuthModule,
    RoleModule,
    UserModule,
    CloudinaryModule,
  ],
  providers: [CloudinaryService],
})
export class AppModule {}
