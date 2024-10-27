// src/modules/role/role.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Role from '../../models/role.model';
import { RoleType } from '../../graphql/types/role.types';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role)
    private roleModel: typeof Role,
  ) {}

  async findAll(): Promise<RoleType[]> {
    try {
      return await this.roleModel.findAll();
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw new Error('Failed to fetch roles');
    }
  }
}
