// src/modules/review/review.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import Review from '../../models/review.model';
import User from '../../models/user.model';
import Product from '../../models/product.model';
import Role from '../../models/role.model';
import Category from '../../models/category.model';
import Brand from '../../models/brand.model';
import {
  ReviewType,
  CreateReviewInput,
  UpdateReviewInput,
  ReviewResponse,
  ReviewsResponse,
  ProductRatingResponse,
  AllReviewsResponse,
} from '../../graphql/types/review.types';
import { UserType } from '../../graphql/types/user.types';
import { ProductType } from '../../graphql/types/product.types';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review)
    private reviewModel: typeof Review,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Product)
    private productModel: typeof Product,
    private sequelize: Sequelize,
  ) {}

  private transformUserToType(user: any): UserType {
    return {
      ...user,
      role_name: user.role?.role_name || 'Customer',
      is_seller: user.role?.role_name === 'Seller',
    } as UserType;
  }

  private transformProductToType(product: any): ProductType {
    return {
      ...product,
      seller_name: product.seller?.user?.name || null,
      store_name: product.seller?.store_name || null,
      category_name: product.category?.category_name || null,
      brand_name: product.brand?.brand_name || null,
    } as ProductType;
  }

  private transformReviewToType(review: Review): ReviewType {
    const plainReview = review.get({ plain: true });
    return {
      review_id: plainReview.review_id,
      product_id: plainReview.product_id,
      user_id: plainReview.user_id,
      rating: plainReview.rating,
      comment: plainReview.comment,
      created_at: plainReview.created_at,
      updated_at: plainReview.updated_at,
      user: plainReview.user
        ? this.transformUserToType(plainReview.user)
        : undefined,
      product: plainReview.product
        ? this.transformProductToType(plainReview.product)
        : undefined,
    };
  }

  async createReview(
    userId: number,
    input: CreateReviewInput,
  ): Promise<ReviewResponse> {
    try {
      const existingReview = await this.reviewModel.findOne({
        where: {
          user_id: userId,
          product_id: input.productId,
        },
      });

      if (existingReview) {
        return {
          success: false,
          message: 'You have already reviewed this product',
          review: null,
        };
      }

      const review = await this.reviewModel.create({
        user_id: userId,
        product_id: input.productId,
        rating: input.rating,
        comment: input.comment,
      });

      const reviewWithRelations = await this.reviewModel.findByPk(
        review.review_id,
        {
          include: [
            {
              model: User,
              as: 'user',
              include: [
                {
                  model: Role,
                  as: 'role',
                },
              ],
            },
            {
              model: Product,
              as: 'product',
              include: [
                {
                  model: Category,
                  as: 'category',
                },
                {
                  model: Brand,
                  as: 'brand',
                },
              ],
            },
          ],
        },
      );

      if (!reviewWithRelations) {
        throw new NotFoundException('Created review not found');
      }

      return {
        success: true,
        message: 'Review created successfully',
        review: this.transformReviewToType(reviewWithRelations),
      };
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        message: error.message,
        review: null,
      };
    }
  }

  async getProductReviews(
    productId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<ReviewsResponse> {
    try {
      const offset = (page - 1) * limit;
      const reviews = await this.reviewModel.findAndCountAll({
        where: { product_id: productId },
        include: [
          {
            model: User,
            as: 'user',
            include: [
              {
                model: Role,
                as: 'role',
              },
            ],
          },
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: Category,
                as: 'category',
              },
              {
                model: Brand,
                as: 'brand',
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      return {
        success: true,
        message: 'Reviews fetched successfully',
        reviews: reviews.rows.map((review) =>
          this.transformReviewToType(review),
        ),
        totalCount: reviews.count,
        totalPages: Math.ceil(reviews.count / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return {
        success: false,
        message: error.message,
        reviews: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };
    }
  }

  async getUserReviews(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<ReviewsResponse> {
    try {
      const offset = (page - 1) * limit;
      const reviews = await this.reviewModel.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: Category,
                as: 'category',
              },
              {
                model: Brand,
                as: 'brand',
              },
            ],
          },
          {
            model: User,
            as: 'user',
            include: [
              {
                model: Role,
                as: 'role',
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      return {
        success: true,
        message: 'Reviews fetched successfully',
        reviews: reviews.rows.map((review) =>
          this.transformReviewToType(review),
        ),
        totalCount: reviews.count,
        totalPages: Math.ceil(reviews.count / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return {
        success: false,
        message: error.message,
        reviews: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };
    }
  }

  async updateReview(
    userId: number,
    input: UpdateReviewInput,
  ): Promise<ReviewResponse> {
    try {
      const review = await this.reviewModel.findOne({
        where: {
          review_id: input.reviewId,
          user_id: userId,
        },
      });

      if (!review) {
        return {
          success: false,
          message: 'Review not found or you are not authorized to update it',
          review: null,
        };
      }

      await review.update({
        rating: input.rating,
        comment: input.comment,
      });

      const updatedReview = await this.reviewModel.findByPk(review.review_id, {
        include: [
          {
            model: User,
            as: 'user',
            include: [
              {
                model: Role,
                as: 'role',
              },
            ],
          },
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: Category,
                as: 'category',
              },
              {
                model: Brand,
                as: 'brand',
              },
            ],
          },
        ],
      });

      return {
        success: true,
        message: 'Review updated successfully',
        review: this.transformReviewToType(updatedReview),
      };
    } catch (error) {
      console.error('Error updating review:', error);
      return {
        success: false,
        message: error.message,
        review: null,
      };
    }
  }

  async deleteReview(
    reviewId: number,
    userId: number,
  ): Promise<ReviewResponse> {
    try {
      const review = await this.reviewModel.findOne({
        where: {
          review_id: reviewId,
          user_id: userId,
        },
      });

      if (!review) {
        return {
          success: false,
          message: 'Review not found or you are not authorized to delete it',
          review: null,
        };
      }

      await review.destroy();

      return {
        success: true,
        message: 'Review deleted successfully',
        review: null,
      };
    } catch (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        message: error.message,
        review: null,
      };
    }
  }

  async getProductRating(productId: number): Promise<ProductRatingResponse> {
    try {
      const result = await this.reviewModel.findOne({
        where: { product_id: productId },
        attributes: [
          [
            this.sequelize.fn('AVG', this.sequelize.col('rating')),
            'averageRating',
          ],
          [
            this.sequelize.fn('COUNT', this.sequelize.col('review_id')),
            'totalReviews',
          ],
        ],
        raw: true,
      });

      const averageRating = result
        ? parseFloat(result['averageRating'] || '0').toFixed(1)
        : '0.0';
      const totalReviews = result ? parseInt(result['totalReviews']) || 0 : 0;

      return {
        success: true,
        message: 'Product rating fetched successfully',
        averageRating: parseFloat(averageRating),
        totalReviews,
      };
    } catch (error) {
      console.error('Error fetching product rating:', error);
      return {
        success: false,
        message: error.message,
        averageRating: 0,
        totalReviews: 0,
      };
    }
  }

  async getAllReviewsForProduct(
    productId: number,
  ): Promise<AllReviewsResponse> {
    try {
      const reviews = await this.reviewModel.findAll({
        where: { product_id: productId },
        include: [
          {
            model: User,
            as: 'user',
            include: [
              {
                model: Role,
                as: 'role',
              },
            ],
          },
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: Category,
                as: 'category',
              },
              {
                model: Brand,
                as: 'brand',
              },
            ],
          },
        ],
      });

      return {
        success: true,
        message: 'All reviews fetched successfully',
        reviews: reviews.map((review) => this.transformReviewToType(review)),
      };
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      return {
        success: false,
        message: error.message,
        reviews: [],
      };
    }
  }
}
