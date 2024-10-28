// src/graphql/resolvers/seller.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SellerService } from '../../modules/seller/seller.service';
import { AuthGuard } from '../../middleware/auth.guard';
import {
  SellerProfileType,
  SellerProfileResponse,
  UserOrdersResponse,
  CreateSellerProfileInput,
  UpdateSellerProfileInput,
} from '../types/seller.types';

interface RequestContext {
  req: {
    user?: {
      user_id: number;
      role: string;
      is_seller: boolean;
    };
  };
}

@Resolver(() => SellerProfileType)
export class SellerResolver {
  constructor(private readonly sellerService: SellerService) {}

  private checkSellerAuth(
    context: RequestContext,
    action: string,
  ): { success: boolean; message: string } {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }
    if (!context.req.user.is_seller) {
      return {
        success: false,
        message: `Only sellers can ${action}`,
      };
    }
    return { success: true, message: '' };
  }

  @Query(() => SellerProfileResponse)
  @UseGuards(AuthGuard)
  async sellerProfile(
    @Context() context: RequestContext,
  ): Promise<SellerProfileResponse> {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Not authenticated',
        sellerProfile: null,
      };
    }

    try {
      return await this.sellerService.getSellerProfile(
        context.req.user.user_id,
      );
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      return {
        success: false,
        message:
          error.message ||
          'An error occurred while fetching the seller profile',
        sellerProfile: null,
      };
    }
  }

  @Query(() => UserOrdersResponse)
  @UseGuards(AuthGuard)
  async sellerOrders(
    @Context() context: RequestContext,
    @Args('limit', { nullable: true }) limit?: number,
    @Args('offset', { nullable: true }) offset?: number,
  ): Promise<UserOrdersResponse> {
    const authCheck = this.checkSellerAuth(context, 'view orders');
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        orders: [],
        totalCount: 0,
      };
    }

    try {
      return await this.sellerService.getSellerOrders(
        context.req.user.user_id,
        limit,
        offset,
      );
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      return {
        success: false,
        message: 'An error occurred while fetching orders',
        orders: [],
        totalCount: 0,
      };
    }
  }

  @Mutation(() => SellerProfileResponse)
  @UseGuards(AuthGuard)
  async createSellerProfile(
    @Args('input') input: CreateSellerProfileInput,
    @Context() context: RequestContext,
  ): Promise<SellerProfileResponse> {
    const authCheck = this.checkSellerAuth(context, 'create a profile');
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        sellerProfile: null,
      };
    }

    try {
      return await this.sellerService.createSellerProfile(
        context.req.user.user_id,
        input,
      );
    } catch (error) {
      console.error('Error creating seller profile:', error);
      return {
        success: false,
        message: error.message,
        sellerProfile: null,
      };
    }
  }

  @Mutation(() => SellerProfileResponse)
  @UseGuards(AuthGuard)
  async updateSellerProfile(
    @Args('input') input: UpdateSellerProfileInput,
    @Context() context: RequestContext,
  ): Promise<SellerProfileResponse> {
    const authCheck = this.checkSellerAuth(context, 'update profile');
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        sellerProfile: null,
      };
    }

    try {
      return await this.sellerService.updateSellerProfile(
        context.req.user.user_id,
        input,
      );
    } catch (error) {
      console.error('Error updating seller profile:', error);
      return {
        success: false,
        message: error.message,
        sellerProfile: null,
      };
    }
  }
}
