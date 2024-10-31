// src/graphql/resolvers/sellerReview.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { SellerReviewService } from '../../modules/sellerReview/sellerReview.service';
import { AuthGuard } from '../../middleware/auth.guard';
import {
  SellerReviewType,
  SellerReviewResponse,
  SellerReviewsResponse,
  SellerRatingResponse,
  CreateSellerReviewInput,
  UpdateSellerReviewInput,
  SellerReviewsQueryInput,
  SellerRatingQueryInput,
} from '../types/sellerReview.types';

interface RequestContext {
  req: {
    user?: {
      user_id: number;
      role: string;
    };
  };
}

@Resolver(() => SellerReviewType)
export class SellerReviewResolver {
  constructor(private readonly sellerReviewService: SellerReviewService) {}

  @Query(() => SellerReviewsResponse)
  async sellerReviews(
    @Args('input') input: SellerReviewsQueryInput,
  ): Promise<SellerReviewsResponse> {
    try {
      return this.sellerReviewService.getSellerReviews(
        input.sellerId,
        input.page,
        input.limit,
      );
    } catch (error) {
      console.error('Error fetching seller reviews:', error);
      return {
        success: false,
        message: error.message,
        reviews: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
    }
  }

  @Query(() => SellerRatingResponse)
  async sellerRating(
    @Args('input') input: SellerRatingQueryInput,
  ): Promise<SellerRatingResponse> {
    try {
      return this.sellerReviewService.getSellerRating(input.sellerId);
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

  @Mutation(() => SellerReviewResponse)
  @UseGuards(AuthGuard)
  async createSellerReview(
    @Context() context: RequestContext,
    @Args('input') input: CreateSellerReviewInput,
  ): Promise<SellerReviewResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        review: null,
      };
    }

    if (context.req.user.role !== 'Customer') {
      throw new ForbiddenException('Only customers can create seller reviews');
    }

    try {
      return this.sellerReviewService.createSellerReview(
        context.req.user.user_id,
        input,
      );
    } catch (error) {
      console.error('Error creating seller review:', error);
      return {
        success: false,
        message: error.message,
        review: null,
      };
    }
  }

  @Mutation(() => SellerReviewResponse)
  @UseGuards(AuthGuard)
  async updateSellerReview(
    @Context() context: RequestContext,
    @Args('input') input: UpdateSellerReviewInput,
  ): Promise<SellerReviewResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        review: null,
      };
    }

    if (context.req.user.role !== 'Customer') {
      throw new ForbiddenException('Only customers can update seller reviews');
    }

    try {
      return this.sellerReviewService.updateSellerReview(
        context.req.user.user_id,
        input,
      );
    } catch (error) {
      console.error('Error updating seller review:', error);
      return {
        success: false,
        message: error.message,
        review: null,
      };
    }
  }

  @Mutation(() => SellerReviewResponse)
  @UseGuards(AuthGuard)
  async deleteSellerReview(
    @Context() context: RequestContext,
    @Args('reviewId') reviewId: number,
  ): Promise<SellerReviewResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        review: null,
      };
    }

    if (context.req.user.role !== 'Customer') {
      throw new ForbiddenException('Only customers can delete seller reviews');
    }

    try {
      return this.sellerReviewService.deleteSellerReview(
        reviewId,
        context.req.user.user_id,
      );
    } catch (error) {
      console.error('Error deleting seller review:', error);
      return {
        success: false,
        message: error.message,
        review: null,
      };
    }
  }
}
