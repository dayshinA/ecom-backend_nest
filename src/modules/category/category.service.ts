// src/modules/category/category.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Category from '../../models/category.model';
import {
  CategoryInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
  CategoryResponse,
  DeleteCategoryResponse,
} from '../../graphql/types/category.types';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
  ) {}

  async getAllCategories() {
    try {
      const categories = await this.categoryModel.findAll();
      return categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async createCategory(input: CategoryInput): Promise<CategoryResponse> {
    try {
      const newCategory = await this.categoryModel.create({
        category_name: input.category_name,
      });

      return {
        success: true,
        message: 'Category created successfully',
        category: newCategory,
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return {
          success: false,
          message: 'Category already exists',
          category: null,
        };
      }
      throw new Error('Failed to create category');
    }
  }

  async editCategory(
    input: UpdateCategoryInput,
  ): Promise<CategoryResponse> {
    try {
      const category = await this.categoryModel.findByPk(input.category_id);

      if (!category) {
        return {
          success: false,
          message: 'Category not found',
          category: null,
        };
      }

      // Check if the new category name already exists for another category
      const existingCategory = await this.categoryModel.findOne({
        where: { category_name: input.category_name },
      });

      if (
        existingCategory &&
        existingCategory.category_id !== input.category_id
      ) {
        return {
          success: false,
          message: 'Category name already exists',
          category: null,
        };
      }

      category.category_name = input.category_name;
      await category.save();

      return {
        success: true,
        message: 'Category updated successfully',
        category,
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return {
          success: false,
          message: 'Category name already exists under a different ID',
          category: null,
        };
      }
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  async deleteCategory(
    input: DeleteCategoryInput,
  ): Promise<DeleteCategoryResponse> {
    try {
      const category = await this.categoryModel.findByPk(input.category_id);

      if (!category) {
        return {
          success: false,
          message: 'Category not found',
        };
      }

      await category.destroy();

      return {
        success: true,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        message: 'Failed to delete category',
      };
    }
  }
}
