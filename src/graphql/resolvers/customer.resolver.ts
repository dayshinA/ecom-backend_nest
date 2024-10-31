// src/graphql/resolvers/customer.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../middleware/auth.guard';
import { CustomerService } from 'src/modules/customer/customer.service';
import { ShippingAddressService } from 'src/modules/shippingAddress/shippingAddress.service';
import { CustomerOrdersResponse } from '../types/customer.types';
import {
  ShippingAddressesResponse,
  ShippingAddressResponse,
  ShippingAddressInput,
  UpdateShippingAddressInput,
  DeleteShippingAddressResponse,
} from '../types/checkout.types';
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
  constructor(
    private readonly customerService: CustomerService,
    private readonly shippingAddressService: ShippingAddressService,
  ) {}

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

  @Query(() => ShippingAddressesResponse)
  @UseGuards(AuthGuard)
  async getUserShippingAddresses(
    @Context() context: RequestContext,
  ): Promise<ShippingAddressesResponse> {
    const authCheck = this.checkCustomerAuth(
      context,
      'view shipping addresses',
    );
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        shippingAddresses: [],
      };
    }

    try {
      return await this.shippingAddressService.getUserShippingAddresses(
        context.req.user.user_id,
      );
    } catch (error) {
      console.error('Error fetching shipping addresses:', error);
      return {
        success: false,
        message: 'An error occurred while fetching shipping addresses',
        shippingAddresses: [],
      };
    }
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

  @Mutation(() => ShippingAddressResponse)
  @UseGuards(AuthGuard)
  async createShippingAddress(
    @Context() context: RequestContext,
    @Args('input') input: ShippingAddressInput,
  ): Promise<ShippingAddressResponse> {
    const authCheck = this.checkCustomerAuth(context, 'add a shipping address');
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        shippingAddress: null,
      };
    }

    try {
      return await this.shippingAddressService.createShippingAddress(
        context.req.user.user_id,
        input,
      );
    } catch (error) {
      console.error('Error adding shipping address:', error);
      return {
        success: false,
        message: 'An error occurred while adding shipping address',
        shippingAddress: null,
      };
    }
  }

  @Mutation(() => ShippingAddressResponse)
  @UseGuards(AuthGuard)
  async updateShippingAddress(
    @Context() context: RequestContext,
    @Args('addressId') addressId: number,
    @Args('input') input: UpdateShippingAddressInput,
  ): Promise<ShippingAddressResponse> {
    const authCheck = this.checkCustomerAuth(
      context,
      'update a shipping address',
    );
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        shippingAddress: null,
      };
    }

    try {
      return await this.shippingAddressService.updateShippingAddress(
        context.req.user.user_id,
        input,
      );
    } catch (error) {
      console.error('Error updating shipping address:', error);
      return {
        success: false,
        message: 'An error occurred while updating shipping address',
        shippingAddress: null,
      };
    }
  }

  @Mutation(() => DeleteShippingAddressResponse)
  @UseGuards(AuthGuard)
  async deleteShippingAddress(
    @Context() context: RequestContext,
    @Args('addressId') addressId: number,
  ): Promise<DeleteShippingAddressResponse> {
    const authCheck = this.checkCustomerAuth(
      context,
      'delete a shipping address',
    );
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
      };
    }

    try {
      return await this.shippingAddressService.deleteShippingAddress(
        addressId,
        context.req.user.user_id,
      );
    } catch (error) {
      console.error('Error deleting shipping address:', error);
      return {
        success: false,
        message: 'An error occurred while deleting shipping address',
      };
    }
  }
}
