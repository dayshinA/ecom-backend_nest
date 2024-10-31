// src/modules/sellerReview/sellerReview.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import SellerReview from '../../models/sellerReview.model';
import User from '../../models/user.model';
import SellerProfile from '../../models/seller.model';
import Role from '../../models/role.model';
import {
  SellerReviewType,
  CreateSellerReviewInput,
  UpdateSellerReviewInput,
  SellerReviewResponse,
  SellerReviewsResponse,
  SellerRatingResponse,
} from '../../graphql/types/sellerReview.types';
import { UserType } from '../../graphql/types/user.types';
import { SellerProfileType } from '../../graphql/types/seller.types';

@Injectable()
export class SellerReviewService {
  constructor(
    @InjectModel(SellerReview)
    private sellerReviewModel: typeof SellerReview,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(SellerProfile)
    private sellerProfileModel: typeof SellerProfile,
    private sequelize: Sequelize,
  ) {}

  private transformUserToType(user: any): UserType {
    return {
      ...user,
      role_name: user.role?.role_name || 'Customer',
      is_seller: user.role?.role_name === 'Seller',
    } as UserType;
  }

  private transformSellerToType(seller: any): SellerProfileType {
    return {
      ...seller,
      user: seller.user ? this.transformUserToType(seller.user) : undefined,
    } as SellerProfileType;
  }

  private transformReviewToType(review: SellerReview): SellerReviewType {
    const plainReview = review.get({ plain: true });
    return {
      review_id: plainReview.review_id,
      seller_id: plainReview.seller_id,
      user_id: plainReview.user_id,
      rating: plainReview.rating,
      comment: plainReview.comment,
      created_at: plainReview.created_at,
      updated_at: plainReview.updated_at,
      user: plainReview.user
        ? this.transformUserToType(plainReview.user)
        : undefined,
      seller: plainReview.seller
        ? this.transformSellerToType(plainReview.seller)
        : undefined,
    };
  }

  async updateSellerRating(sellerId: number): Promise<string> {
    try {
      const result = await this.sellerReviewModel.findOne({
        where: { seller_id: sellerId },
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
        ? parseFloat(result['averageRating'] || '0').toFixed(2)
        : '0.00';

      await this.sellerProfileModel.update(
        { rating: parseFloat(averageRating) },
        { where: { seller_id: sellerId } },
      );

      return averageRating;
    } catch (error) {
      console.error('Error updating seller rating:', error);
      throw new BadRequestException('Failed to update seller rating');
    }
  }

  async createSellerReview(
    userId: number,
    input: CreateSellerReviewInput,
  ): Promise<SellerReviewResponse> {
    try {
      const existingReview = await this.sellerReviewModel.findOne({
        where: {
          user_id: userId,
          seller_id: input.sellerId,
        },
      });

      if (existingReview) {
        return {
          success: false,
          message: 'You have already reviewed this seller',
          review: null,
        };
      }

      const review = await this.sellerReviewModel.create({
        user_id: userId,
        seller_id: input.sellerId,
        rating: input.rating,
        comment: input.comment,
      });

      await this.updateSellerRating(input.sellerId);

      const reviewWithDetails = await this.sellerReviewModel.findByPk(
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
              model: SellerProfile,
              as: 'seller',
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
              ],
            },
          ],
        },
      );

      if (!reviewWithDetails) {
        throw new NotFoundException('Created review not found');
      }

      return {
        success: true,
        message: 'Seller review created successfully',
        review: this.transformReviewToType(reviewWithDetails),
      };
    } catch (error) {
      console.error('Error creating seller review:', error);
      return {
        success: false,
        message: error.message,
        review: null,
      };
    }
  }

  async getSellerReviews(
    sellerId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<SellerReviewsResponse> {
    try {
      const offset = (page - 1) * limit;
      const reviews = await this.sellerReviewModel.findAndCountAll({
        where: { seller_id: sellerId },
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
            model: SellerProfile,
            as: 'seller',
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
            ],
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      return {
        success: true,
        message: 'Seller reviews fetched successfully',
        reviews: reviews.rows.map((review) =>
          this.transformReviewToType(review),
        ),
        totalCount: reviews.count,
        totalPages: Math.ceil(reviews.count / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching seller reviews:', error);
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

  async updateSellerReview(
    userId: number,
    input: UpdateSellerReviewInput,
  ): Promise<SellerReviewResponse> {
    try {
      const review = await this.sellerReviewModel.findOne({
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

      await this.updateSellerRating(review.seller_id);

      const updatedReview = await this.sellerReviewModel.findByPk(
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
              model: SellerProfile,
              as: 'seller',
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
              ],
            },
          ],
        },
      );

      return {
        success: true,
        message: 'Seller review updated successfully',
        review: this.transformReviewToType(updatedReview),
      };
    } catch (error) {
      console.error('Error updating seller review:', error);
      return {
        success: false,
        message: error.message,
        review: null,
      };
    }
  }

  async deleteSellerReview(
    reviewId: number,
    userId: number,
  ): Promise<SellerReviewResponse> {
    try {
      const review = await this.sellerReviewModel.findOne({
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

      const sellerId = review.seller_id;
      await review.destroy();
      await this.updateSellerRating(sellerId);

      return {
        success: true,
        message: 'Seller review deleted successfully',
        review: null,
      };
    } catch (error) {
      console.error('Error deleting seller review:', error);
      return {
        success: false,
        message: error.message,
        review: null,
      };
    }
  }

  async getSellerRating(sellerId: number): Promise<SellerRatingResponse> {
    try {
      const result = await this.sellerReviewModel.findOne({
        where: { seller_id: sellerId },
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
        ? parseFloat(parseFloat(result['averageRating'] || '0').toFixed(1))
        : 0;
      const totalReviews = result ? parseInt(result['totalReviews']) || 0 : 0;

      return {
        success: true,
        message: 'Seller rating fetched successfully',
        averageRating,
        totalReviews,
      };
    } catch (error) {
      console.error('Error fetching seller rating:', error);
      return {
        success: false,
        message: error.message,
        averageRating: 0,
        totalReviews: 0,
      };
    }
  }
}
