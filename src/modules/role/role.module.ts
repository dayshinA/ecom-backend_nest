// src/modules/role/role.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Role from '../../models/role.model';
import { RoleService } from './role.service';
import { RoleResolver } from '../../graphql/resolvers/role.resolver';

@Module({
  imports: [SequelizeModule.forFeature([Role])],
  providers: [RoleService, RoleResolver],
  exports: [RoleService],
})
export class RoleModule {}
