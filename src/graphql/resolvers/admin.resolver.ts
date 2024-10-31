// src/graphql/resolvers/admin.resolver.ts
// src/graphql/resolvers/admin.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from '../../modules/admin/admin.service';
import { AuthGuard } from '../../middleware/auth.guard';
import { PaymentMethodService } from '../../modules/paymentMethod/paymentMethod.service';
import {
  CreateAdminInput,
  CreateAdminResponse,
  UpdateUserRoleInput,
  UpdateUserRoleResponse,
  AllUsersResponse,
  AllCustomersResponse,
  AllSellersResponse,
  SellersWithProfileResponse,
  DeleteUserResponse,
  GetOrdersInput,
  OrderResponse,
  OrdersResponse,
} from '../types/admin.types';
import { UserType } from '../types/user.types';
import {
  PaymentMethodInput,
  PaymentMethodUpdateInput,
  PaymentMethodResponse,
  DeletePaymentMethodResponse,
} from '../types/checkout.types';

interface RequestContext {
  req: {
    user?: {
      user_id: number;
      role: string;
    };
  };
}

@Resolver(() => UserType)
export class AdminResolver {
  constructor(
    private readonly adminService: AdminService,
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  private checkAdminAccess(context: RequestContext, action: string) {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }
    if (context.req.user.role !== 'Admin') {
      return {
        success: false,
        message: `Only admins can ${action}`,
      };
    }
  }

  @Query(() => AllUsersResponse)
  @UseGuards(AuthGuard)
  async getAllUsers(
    @Context() context: RequestContext,
  ): Promise<AllUsersResponse> {
    this.checkAdminAccess(context, 'access this information');
    return this.adminService.getAllUsers();
  }

  @Query(() => AllCustomersResponse)
  @UseGuards(AuthGuard)
  async getCustomers(
    @Context() context: RequestContext,
  ): Promise<AllCustomersResponse> {
    this.checkAdminAccess(context, 'access this information');
    return this.adminService.getCustomers();
  }

  @Query(() => AllSellersResponse)
  @UseGuards(AuthGuard)
  async getSellers(
    @Context() context: RequestContext,
  ): Promise<AllSellersResponse> {
    this.checkAdminAccess(context, 'access this information');
    return this.adminService.getSellers();
  }

  @Query(() => SellersWithProfileResponse)
  @UseGuards(AuthGuard)
  async getSellersWithProfile(
    @Context() context: RequestContext,
  ): Promise<SellersWithProfileResponse> {
    this.checkAdminAccess(context, 'access this information');
    return this.adminService.getSellersWithProfile();
  }

  @Query(() => UserType, { nullable: true })
  @UseGuards(AuthGuard)
  async getUserById(
    @Args('userId') userId: number,
    @Context() context: RequestContext,
  ) {
    this.checkAdminAccess(context, 'access this information');
    try {
      return await this.adminService.getUserById(userId);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Query(() => OrdersResponse)
  @UseGuards(AuthGuard)
  async getAllOrders(
    @Args('input', { nullable: true }) input: GetOrdersInput,
    @Context() context: RequestContext,
  ): Promise<OrdersResponse> {
    this.checkAdminAccess(context, 'access all orders');
    return this.adminService.getAllOrders(input || { limit: 10, offset: 0 });
  }

  @Query(() => OrderResponse)
  @UseGuards(AuthGuard)
  async getOrder(
    @Args('orderId') orderId: number,
    @Context() context: RequestContext,
  ): Promise<OrderResponse> {
    this.checkAdminAccess(context, 'access order details');
    return this.adminService.getOrderById(orderId);
  }

  @Mutation(() => PaymentMethodResponse)
  @UseGuards(AuthGuard)
  async createPaymentMethod(
    @Args('input') input: PaymentMethodInput,
    @Context() context: RequestContext,
  ): Promise<PaymentMethodResponse> {
    this.checkAdminAccess(context, 'create new payment methods');
    return this.paymentMethodService.createPaymentMethod(input);
  }

  @Mutation(() => PaymentMethodResponse)
  @UseGuards(AuthGuard)
  async updatePaymentMethod(
    @Args('input') input: PaymentMethodUpdateInput,
    @Context() context: RequestContext,
  ): Promise<PaymentMethodResponse> {
    this.checkAdminAccess(context, 'update payment methods');
    return this.paymentMethodService.updatePaymentMethod(input);
  }

  @Mutation(() => DeletePaymentMethodResponse)
  @UseGuards(AuthGuard)
  async deletePaymentMethod(
    @Args('methodId') methodId: number,
    @Context() context: RequestContext,
  ): Promise<DeletePaymentMethodResponse> {
    this.checkAdminAccess(context, 'delete payment methods');
    return this.paymentMethodService.deletePaymentMethod(methodId);
  }

  @Mutation(() => CreateAdminResponse)
  @UseGuards(AuthGuard)
  async createAdmin(
    @Args('input') input: CreateAdminInput,
    @Context() context: RequestContext,
  ): Promise<CreateAdminResponse> {
    this.checkAdminAccess(context, 'create new admin users');
    return this.adminService.createAdmin(input);
  }

  @Mutation(() => UpdateUserRoleResponse)
  @UseGuards(AuthGuard)
  async updateUserRole(
    @Args('input') input: UpdateUserRoleInput,
    @Context() context: RequestContext,
  ): Promise<UpdateUserRoleResponse> {
    this.checkAdminAccess(context, 'update user roles');
    return this.adminService.updateUserRole(input);
  }

  @Mutation(() => DeleteUserResponse)
  @UseGuards(AuthGuard)
  async deleteUser(
    @Args('userId') userId: number,
    @Context() context: RequestContext,
  ): Promise<DeleteUserResponse> {
    this.checkAdminAccess(context, 'delete users');
    return this.adminService.deleteUser(userId);
  }
}
