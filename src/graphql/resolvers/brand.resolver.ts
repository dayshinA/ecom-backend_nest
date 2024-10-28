// src/graphql/resolvers/brand.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BrandService } from '../../modules/brand/brand.service';
import { AuthGuard } from '../../middleware/auth.guard';
import {
  BrandType,
  BrandInput,
  UpdateBrandInput,
  DeleteBrandInput,
  CreateBrandResponse,
  UpdateBrandResponse,
  DeleteBrandResponse,
} from '../types/brand.types';

@Resolver(() => BrandType)
export class BrandResolver {
  constructor(private readonly brandService: BrandService) {}

  @Query(() => [BrandType])
  async brands() {
    try {
      return await this.brandService.getAllBrands();
    } catch (error) {
      console.error('Error resolving brands:', error);
      return [];
    }
  }

  @Mutation(() => CreateBrandResponse)
  @UseGuards(AuthGuard)
  async createBrand(
    @Context() context,
    @Args('input') input: BrandInput,
  ): Promise<CreateBrandResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        brand: null,
      };
    } else if (context.req.user.role !== 'Admin') {
      return {
        success: false,
        message: 'Only admins can create brands',
        brand: null,
      };
    }

    try {
      return await this.brandService.createBrand(input);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        brand: null,
      };
    }
  }

  @Mutation(() => UpdateBrandResponse)
  @UseGuards(AuthGuard)
  async updateBrand(
    @Context() context,
    @Args('input') input: UpdateBrandInput,
  ): Promise<UpdateBrandResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        brand: null,
      };
    } else if (context.req.user.role !== 'Admin') {
      return {
        success: false,
        message: 'Only admins can update brands',
        brand: null,
      };
    }
  }

  @Mutation(() => DeleteBrandResponse)
  @UseGuards(AuthGuard)
  async deleteBrand(
    @Context() context,
    @Args('input') input: DeleteBrandInput,
  ): Promise<DeleteBrandResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    } else if (context.req.user.role !== 'Admin') {
      return {
        success: false,
        message: 'Only admins can delete brands',
      };
    }

    try {
      return await this.brandService.deleteBrand(input);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
