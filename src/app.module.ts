// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './config/cloudinary.config';
import { join } from 'path';
import { CloudinaryModule } from './config/cloudinary.module';
import { models } from './models';
import { featureModules } from './modules';

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
      models: models,
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

    ...featureModules,
    CloudinaryModule,
  ],
  providers: [CloudinaryService],
})
export class AppModule {}
