// src/graphql/resolvers/category.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { CategoryService } from '../../modules/category/category.service';
import { AuthGuard } from '../../middleware/auth.gurad';
import {
  CategoryType,
  CategoryInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
  CreateCategoryResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
} from '../types/category.types';

@Resolver(() => CategoryType)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => [CategoryType])
  async categories() {
    try {
      return await this.categoryService.getAllCategories();
    } catch (error) {
      console.error('Error resolving categories:', error);
      return [];
    }
  }

  @Mutation(() => CreateCategoryResponse)
  @UseGuards(AuthGuard)
  async createCategory(
    @Context() context,
    @Args('input') input: CategoryInput,
  ): Promise<CreateCategoryResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        category: null,
      };
    } else if (context.req.user.role !== 'Admin') {
      return {
        success: false,
        message: 'Only admins can create categories',
        category: null,
      };
    }

    try {
      return await this.categoryService.createCategory(input);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        category: null,
      };
    }
  }

  @Mutation(() => UpdateCategoryResponse)
  @UseGuards(AuthGuard)
  async updateCategory(
    @Context() context,
    @Args('input') input: UpdateCategoryInput,
  ): Promise<UpdateCategoryResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        category: null,
      };
    } else if (context.req.user.role !== 'Admin') {
      return {
        success: false,
        message: 'Only admins can update categories',
        category: null,
      };
    }

    try {
      return await this.categoryService.editCategory(input);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        category: null,
      };
    }
  }

  @Mutation(() => DeleteCategoryResponse)
  @UseGuards(AuthGuard)
  async deleteCategory(
    @Context() context,
    @Args('input') input: DeleteCategoryInput,
  ): Promise<DeleteCategoryResponse> {
    // if (!context.req.user || context.req.user.role !== 'Admin') {
    //   throw new ForbiddenException('Only admins can delete categories');
    // }

    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    } else if (context.req.user.role !== 'Admin') {
      return {
        success: false,
        message: 'Only admins can delete categories',
      };
    }

    try {
      return await this.categoryService.deleteCategory(input);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
