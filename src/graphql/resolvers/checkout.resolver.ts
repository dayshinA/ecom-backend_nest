// src/graphql/resolvers/checkout.resolver.ts
import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CheckoutService } from '../../modules/checkout/checkout.service';
import { AuthGuard } from '../../middleware/auth.guard';
import {
  CheckoutResponse,
  CheckoutInput,
  PaymentMethodType,
} from '../types/checkout.types';
import { PaymentMethodService } from '../../modules/paymentMethod/paymentMethod.service';

interface RequestContext {
  req: {
    user?: {
      user_id: number;
      role: string;
    };
  };
}

@Resolver()
export class CheckoutResolver {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  @Query(() => [PaymentMethodType])
  async paymentMethods() {
    try {
      return await this.paymentMethodService.getAllPaymentMethods();
    } catch (error) {
      console.error('Error resolving payment methods:', error);
      return [];
    }
  }

  @Mutation(() => CheckoutResponse)
  @UseGuards(AuthGuard)
  async checkout(
    @Context() context: RequestContext,
    @Args('input') input: CheckoutInput,
  ): Promise<CheckoutResponse> {
    // Check if user is authenticated
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        order: null,
      };
    }

    try {
      return await this.checkoutService.processCheckout(
        context.req.user.user_id,
        input,
      );
    } catch (error) {
      console.error('Error processing checkout:', error);
      return {
        success: false,
        message: error.message || 'Failed to process checkout',
        order: null,
      };
    }
  }
}
