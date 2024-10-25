// src/graphql/resolvers/role.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../../models/role.model';
import { RoleType } from '../types/role.types';

@Resolver(() => RoleType)
export class RoleResolver {
  constructor(@InjectModel(Role) private roleModel: typeof Role) {}

  @Query(() => [RoleType], { name: 'roles' })
  async getRoles(): Promise<Role[]> {
    try {
      return await this.roleModel.findAll();
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw new Error('Failed to fetch roles');
    }
  }
}
