// src/graphql/resolvers/cart.resolver.ts
// src/graphql/resolvers/cart.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartService } from '../../modules/cart/cart.service';
import { CartGuard } from '../../middleware/cart.guard';
import {
  CartType,
  CartResponse,
  AddToCartInput,
  UpdateCartItemInput,
} from '../types/cart.types';

interface RequestContext {
  req: {
    user?: {
      user_id: number;
    };
    sessionId?: string;
  };
}

@Resolver(() => CartType)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => CartResponse)
  @UseGuards(CartGuard)
  async getCart(@Context() context: RequestContext): Promise<CartResponse> {
    try {
      return await this.cartService.getCart(
        context.req.user?.user_id,
        context.req.sessionId,
      );
    } catch (error) {
      console.error('Error fetching cart:', error);
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }

  @Mutation(() => CartResponse)
  @UseGuards(CartGuard)
  async addToCart(
    @Args('input') input: AddToCartInput,
    @Context() context: RequestContext,
  ): Promise<CartResponse> {
    try {
      return await this.cartService.addToCart(
        context.req.user?.user_id,
        context.req.sessionId,
        input,
      );
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }

  @Mutation(() => CartResponse)
  @UseGuards(CartGuard)
  async updateCartItem(
    @Args('input') input: UpdateCartItemInput,
    @Context() context: RequestContext,
  ): Promise<CartResponse> {
    try {
      return await this.cartService.updateCartItem(
        context.req.user?.user_id,
        context.req.sessionId,
        input,
      );
    } catch (error) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }

  @Mutation(() => CartResponse)
  @UseGuards(CartGuard)
  async removeFromCart(
    @Args('cart_item_id') cart_item_id: number,
    @Context() context: RequestContext,
  ): Promise<CartResponse> {
    try {
      return await this.cartService.removeFromCart(
        context.req.user?.user_id,
        context.req.sessionId,
        cart_item_id,
      );
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }

  @Mutation(() => CartResponse)
  @UseGuards(CartGuard)
  async clearCart(@Context() context: RequestContext): Promise<CartResponse> {
    try {
      return await this.cartService.clearCart(
        context.req.user?.user_id,
        context.req.sessionId,
      );
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }

  @Mutation(() => CartResponse)
  @UseGuards(CartGuard)
  async mergeGuestCart(
    @Args('guest_session_id') guestSessionId: string,
    @Context() context: RequestContext,
  ): Promise<CartResponse> {
    if (!context.req.user?.user_id) {
      return {
        success: false,
        message: 'User must be logged in to merge carts',
        cart: null,
      };
    }

    try {
      return await this.cartService.mergeGuestCartWithUserCart(
        guestSessionId,
        context.req.user.user_id,
      );
    } catch (error) {
      console.error('Error merging carts:', error);
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }
}
