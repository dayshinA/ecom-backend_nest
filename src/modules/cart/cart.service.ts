// src/modules/cart/cart.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import Cart from '../../models/cart.model';
import CartItem from '../../models/cartItem.model';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import SellerInventory from '../../models/sellerInventory.model';
import {
  CartType,
  CartItemType,
  AddToCartInput,
  UpdateCartItemInput,
  CartResponse,
} from '../../graphql/types/cart.types';

import { ProductType } from 'src/graphql/types/product.types';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart)
    private cartModel: typeof Cart,
    @InjectModel(CartItem)
    private cartItemModel: typeof CartItem,
    @InjectModel(Product)
    private productModel: typeof Product,
    @InjectModel(ProductVariation)
    private productVariationModel: typeof ProductVariation,
    @InjectModel(SellerInventory)
    private sellerInventoryModel: typeof SellerInventory,
    private sequelize: Sequelize,
  ) {}

  private transformToProductType(product: Product): ProductType {
    const plainProduct = product.get({ plain: true });
    return {
      ...plainProduct,
      seller_name: plainProduct.seller?.user?.name || null,
      store_name: plainProduct.seller?.store_name || null,
      category_name: plainProduct.category?.category_name || null,
      brand_name: plainProduct.brand?.brand_name || null,
    };
  }

  private transformToCartItemType(cartItem: CartItem): CartItemType {
    const plainItem = cartItem.get({ plain: true });
    return {
      cart_item_id: plainItem.cart_item_id,
      cart_id: plainItem.cart_id,
      product: this.transformToProductType(cartItem.product),
      variation: plainItem.variation || null,
      quantity: plainItem.quantity,
      price: plainItem.price,
      total_price: plainItem.total_price,
      created_at: plainItem.created_at,
      updated_at: plainItem.updated_at,
    };
  }

  private transformToCartType(cart: Cart): CartType {
    const plainCart = cart.get({ plain: true });
    return {
      cart_id: plainCart.cart_id,
      user_id: plainCart.user_id,
      session_id: plainCart.session_id,
      items:
        cart.items?.map((item) => this.transformToCartItemType(item)) || [],
      total_price: plainCart.total_price,
      created_at: plainCart.created_at,
      updated_at: plainCart.updated_at,
    };
  }

  private async getOrCreateCart(
    userId?: number,
    sessionId?: string,
  ): Promise<Cart> {
    const includeOptions = [
      {
        model: CartItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
          },
          {
            model: ProductVariation,
            as: 'variation',
          },
        ],
      },
    ];

    let cart: Cart;

    if (userId) {
      cart = await this.cartModel.findOne({
        where: { user_id: userId },
        include: includeOptions,
      });
    } else if (sessionId) {
      cart = await this.cartModel.findOne({
        where: { session_id: sessionId },
        include: includeOptions,
      });
    }

    if (!cart) {
      cart = await this.cartModel.create(
        userId ? { user_id: userId } : { session_id: sessionId },
      );

      cart = await this.cartModel.findOne({
        where: { cart_id: cart.cart_id },
        include: includeOptions,
      });
    }

    // Calculate and update total price
    await this.updateCartTotalPrice(cart.cart_id);
    return cart;
  }

  async getCart(userId?: number, sessionId?: string): Promise<CartResponse> {
    try {
      const cart = await this.getOrCreateCart(userId, sessionId);
      return {
        success: true,
        message: 'Cart retrieved successfully',
        cart: this.transformToCartType(cart),
      };
    } catch (error) {
      console.error('Error getting cart:', error);
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }

  private async checkInventory(
    product_id: number,
    variation_id: number | null,
    transaction: any,
  ): Promise<number> {
    if (variation_id) {
      const inventoryItem = await this.sellerInventoryModel.findOne({
        where: { product_id, variation_id },
        transaction,
      });
      return inventoryItem ? inventoryItem.quantity : 0;
    } else {
      const product = await this.productModel.findByPk(product_id, {
        transaction,
      });
      return product ? product.stock_quantity : 0;
    }
  }

  private async updateCartTotalPrice(
    cart_id: number,
    transaction?: any,
  ): Promise<void> {
    const cartItems = await this.cartItemModel.findAll({
      where: { cart_id },
      transaction,
    });

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.total_price),
      0,
    );

    await this.cartModel.update(
      { total_price: totalPrice },
      {
        where: { cart_id },
        transaction,
      },
    );
  }

  async addToCart(
    userId: number | undefined,
    sessionId: string | undefined,
    input: AddToCartInput,
  ): Promise<CartResponse> {
    const transaction = await this.sequelize.transaction();

    try {
      let cart = await this.getOrCreateCart(userId, sessionId);

      let product: Product;
      let price: number;

      if (input.variation_id) {
        const variation = await this.productVariationModel.findByPk(
          input.variation_id,
          {
            transaction,
          },
        );
        if (!variation) {
          throw new NotFoundException('Product variation not found');
        }
        price = variation.price;
        product = await this.productModel.findByPk(variation.product_id, {
          transaction,
        });
      } else {
        product = await this.productModel.findByPk(input.product_id, {
          transaction,
        });
        price = product.price;
      }

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Check inventory
      const availableQuantity = await this.checkInventory(
        input.product_id,
        input.variation_id,
        transaction,
      );

      if (input.quantity > availableQuantity) {
        throw new BadRequestException(
          `Not enough stock. Available: ${availableQuantity}`,
        );
      }

      const existingItem = await this.cartItemModel.findOne({
        where: {
          cart_id: cart.cart_id,
          product_id: input.product_id,
          variation_id: input.variation_id || null,
        },
        transaction,
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + input.quantity;
        if (newQuantity > availableQuantity) {
          throw new BadRequestException(
            `Not enough stock. Available: ${availableQuantity}`,
          );
        }
        await existingItem.update(
          {
            quantity: newQuantity,
            total_price: Number(price) * newQuantity,
          },
          { transaction },
        );
      } else {
        await this.cartItemModel.create(
          {
            cart_id: cart.cart_id,
            product_id: input.product_id,
            variation_id: input.variation_id,
            quantity: input.quantity,
            price,
            total_price: Number(price) * input.quantity,
          },
          { transaction },
        );
      }

      await this.updateCartTotalPrice(cart.cart_id, transaction);
      await transaction.commit();

      const updatedCart = await this.getCart(userId, sessionId);
      return {
        success: true,
        message: 'Item added to cart successfully',
        cart: updatedCart.cart,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }

  async updateCartItem(
    userId: number | undefined,
    sessionId: string | undefined,
    input: UpdateCartItemInput,
  ): Promise<CartResponse> {
    const transaction = await this.sequelize.transaction();

    try {
      const cart = await this.getOrCreateCart(userId, sessionId);

      const cartItem = await this.cartItemModel.findOne({
        where: { cart_item_id: input.cart_item_id, cart_id: cart.cart_id },
        transaction,
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      if (input.quantity > 0) {
        const availableQuantity = await this.checkInventory(
          cartItem.product_id,
          cartItem.variation_id,
          transaction,
        );

        if (input.quantity > availableQuantity) {
          throw new BadRequestException(
            `Not enough stock. Available: ${availableQuantity}`,
          );
        }

        await cartItem.update(
          {
            quantity: input.quantity,
            total_price: Number(cartItem.price) * input.quantity,
          },
          { transaction },
        );
      } else {
        await cartItem.destroy({ transaction });
      }

      await this.updateCartTotalPrice(cart.cart_id, transaction);
      await transaction.commit();

      const updatedCart = await this.getCart(userId, sessionId);
      return {
        success: true,
        message: 'Cart item updated successfully',
        cart: updatedCart.cart,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }

  async removeFromCart(
    userId: number | undefined,
    sessionId: string | undefined,
    cartItemId: number,
  ): Promise<CartResponse> {
    const transaction = await this.sequelize.transaction();

    try {
      const cart = await this.getOrCreateCart(userId, sessionId);

      const cartItem = await this.cartItemModel.findOne({
        where: { cart_item_id: cartItemId, cart_id: cart.cart_id },
        transaction,
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      await cartItem.destroy({ transaction });
      await this.updateCartTotalPrice(cart.cart_id, transaction);
      await transaction.commit();

      const updatedCart = await this.getCart(userId, sessionId);
      return {
        success: true,
        message: 'Item removed from cart successfully',
        cart: updatedCart.cart,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }

  async clearCart(
    userId: number | undefined,
    sessionId: string | undefined,
  ): Promise<CartResponse> {
    const transaction = await this.sequelize.transaction();

    try {
      const cart = await this.getOrCreateCart(userId, sessionId);

      await this.cartItemModel.destroy({
        where: { cart_id: cart.cart_id },
        transaction,
      });

      await this.updateCartTotalPrice(cart.cart_id, transaction);
      await transaction.commit();

      const updatedCart = await this.getCart(userId, sessionId);
      return {
        success: true,
        message: 'Cart cleared successfully',
        cart: updatedCart.cart,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }

  async mergeGuestCartWithUserCart(
    guestSessionId: string,
    userId: number,
  ): Promise<CartResponse> {
    const transaction = await this.sequelize.transaction();

    try {
      const guestCartResponse = await this.getCart(null, guestSessionId);
      const guestCart = guestCartResponse.cart;

      if (guestCart?.items?.length > 0) {
        for (const item of guestCart.items) {
          await this.addToCart(userId, null, {
            product_id: item.product.product_id,
            variation_id: item.variation?.variation_id,
            quantity: item.quantity,
          });
        }

        await this.cartModel.destroy({
          where: { session_id: guestSessionId },
          transaction,
        });
      }

      await transaction.commit();
      return this.getCart(userId, null);
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        message: error.message,
        cart: null,
      };
    }
  }
}
