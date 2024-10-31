// src/modules/brand/brand.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Brand from '../../models/brand.model';
import {
  BrandInput,
  UpdateBrandInput,
  DeleteBrandInput,
  CreateBrandResponse,
  UpdateBrandResponse,
  DeleteBrandResponse,
} from '../../graphql/types/brand.types';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand)
    private brandModel: typeof Brand,
  ) {}

  async getAllBrands() {
    try {
      const brands = await this.brandModel.findAll();
      return brands || [];
    } catch (error) {
      console.error('Error fetching brands', error);
      return {
        success: false,
        message: 'Failed to fetch brands',
      };
    }
  }

  async createBrand(input: BrandInput): Promise<CreateBrandResponse> {
    try {
      const newBrand = await this.brandModel.create({
        brand_name: input.brand_name,
      });

      return {
        success: true,
        message: 'Brand created successfully',
        brand: newBrand,
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return {
          success: false,
          message: 'Brand already exists',
          brand: null,
        };
      }
      return {
        success: false,
        message: 'Failed to create Brand',
        brand: null,
      };
    }
  }

  async editBrand(input: UpdateBrandInput): Promise<UpdateBrandResponse> {
    try {
      const brand = await this.brandModel.findByPk(input.brand_id);

      // check brand
      if (!brand) {
        return {
          success: false,
          message: 'Brand not found',
          brand: null,
        };
      }

      // check if brand name exists
      const existingBrand = await this.brandModel.findOne({
        where: { brand_name: input.brand_name },
      });

      if (existingBrand && existingBrand.brand_id !== input.brand_id) {
        return {
          success: false,
          message: 'Brand name already exists',
          brand: null,
        };
      }

      // Update brand name
      brand.brand_name = input.brand_name;
      await brand.save();

      // Return success response with updated brand
      return {
        success: true,
        message: 'Brand updated successfully',
        brand: brand,
      };
    } catch (error) {
      // Handle any errors
      return {
        success: false,
        message: 'Failed to update brand',
        brand: null,
      };
    }
  }

  async deleteBrand(input: DeleteBrandInput): Promise<DeleteBrandResponse> {
    try {
      const brand = await this.brandModel.findByPk(input.brand_id);
      if (!brand) {
        return {
          success: false,
          message: 'Brand not found',
        };
      }

      await brand.destroy();

      return {
        success: true,
        message: 'Brand deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting brand:', error);
      return {
        success: false,
        message: 'Failed to delete brand',
      };
    }
  }
}
