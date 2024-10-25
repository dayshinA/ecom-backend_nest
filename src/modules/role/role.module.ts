// src/modules/role/role.module.ts
import { Module } from '@nestjs/common';
import { RoleResolver } from '../../graphql/resolvers/role.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '../../models/role.model';

@Module({
  imports: [SequelizeModule.forFeature([Role])],
  providers: [RoleResolver],
})
export class RoleModule {}
