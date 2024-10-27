// src/graphql/resolvers/role.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';
import { RoleService } from '../../modules/role/role.service';
import { RoleType } from '../types/role.types';

@Resolver(() => RoleType)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Query(() => [RoleType])
  async roles() {
    return this.roleService.findAll();
  }
}
