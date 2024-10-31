// src/graphql/resolvers/review.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewService } from '../../modules/review/review.service';
import { AuthGuard } from '../../middleware/auth.guard';
import {
  ReviewType,
  ReviewResponse,
  ReviewsResponse,
  ProductRatingResponse,
  AllReviewsResponse,
  CreateReviewInput,
  UpdateReviewInput,
} from '../types/review.types';

interface RequestContext {
  req: {
    user?: {
      user_id: number;
      role: string;
    };
  };
}

@Resolver(() => ReviewType)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Query(() => ReviewsResponse)
  async productReviews(
    @Args('productId') productId: number,
    @Args('page', { nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { nullable: true, defaultValue: 10 }) limit: number,
  ): Promise<ReviewsResponse> {
    return this.reviewService.getProductReviews(productId, page, limit);
  }

  @Query(() => AllReviewsResponse)
  async allReviewsForProduct(
    @Args('productId') productId: number,
  ): Promise<AllReviewsResponse> {
    return this.reviewService.getAllReviewsForProduct(productId);
  }

  @Query(() => ProductRatingResponse)
  async productRating(
    @Args('productId') productId: number,
  ): Promise<ProductRatingResponse> {
    return this.reviewService.getProductRating(productId);
  }

  @Query(() => ReviewsResponse)
  @UseGuards(AuthGuard)
  async userReviews(
    @Context() context: RequestContext,
    @Args('page', { nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { nullable: true, defaultValue: 10 }) limit: number,
  ): Promise<ReviewsResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        reviews: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    return this.reviewService.getUserReviews(
      context.req.user.user_id,
      page,
      limit,
    );
  }

  @Mutation(() => ReviewResponse)
  @UseGuards(AuthGuard)
  async createReview(
    @Context() context: RequestContext,
    @Args('input') input: CreateReviewInput,
  ): Promise<ReviewResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        review: null,
      };
    }

    if (context.req.user.role !== 'Customer') {
      return {
        success: false,
        message: 'Only customers can create reviews',
        review: null,
      };
    }

    return this.reviewService.createReview(context.req.user.user_id, input);
  }

  @Mutation(() => ReviewResponse)
  @UseGuards(AuthGuard)
  async updateReview(
    @Context() context: RequestContext,
    @Args('input') input: UpdateReviewInput,
  ): Promise<ReviewResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        review: null,
      };
    }

    return this.reviewService.updateReview(context.req.user.user_id, input);
  }

  @Mutation(() => ReviewResponse)
  @UseGuards(AuthGuard)
  async deleteReview(
    @Context() context: RequestContext,
    @Args('reviewId') reviewId: number,
  ): Promise<ReviewResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        review: null,
      };
    }

    return this.reviewService.deleteReview(reviewId, context.req.user.user_id);
  }
}
