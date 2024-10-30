// src/graphql/resolvers/customer.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../middleware/auth.guard';
import { CustomerService } from 'src/modules/customer/customer.service';
import { CustomerOrdersResponse } from '../types/customer.types';
import { UserType } from '../types/user.types';

interface RequestContext {
  req: {
    user?: {
      user_id: number;
      role: string;
      is_seller: boolean;
    };
  };
}

@Resolver(() => UserType)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  private checkCustomerAuth(context: RequestContext, action: string) {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }
    if (context.req.user.role !== 'Customer') {
      return {
        success: false,
        message: `Only customers can ${action}`,
      };
    }

    return {
      success: true,
      message: 'Authentication successful',
    };
  }

  @Query(() => CustomerOrdersResponse)
  @UseGuards(AuthGuard)
  async getCustomerOrders(
    @Context() context: RequestContext,
    @Args('limit', { nullable: true }) limit?: number,
    @Args('offset', { nullable: true }) offset?: number,
  ): Promise<CustomerOrdersResponse> {
    const authCheck = this.checkCustomerAuth(context, 'view orders');
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        orders: [],
        totalCount: 0,
      };
    }

    try {
      return await this.customerService.getCustomerOrders(
        context.req.user.user_id,
        limit,
        offset,
      );
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return {
        success: false,
        message: 'An error occurred while fetching orders',
        orders: [],
        totalCount: 0,
      };
    }
  }
}
