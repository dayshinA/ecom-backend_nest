// src/modules/checkout/checkout.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import Cart from '../../models/cart.model';
import CartItem from '../../models/cartItem.model';
import Order from '../../models/order.model';
import OrderDetail from '../../models/order_detail.model';
import ShippingAddress from '../../models/shippingAddress.model';
import Payment from '../../models/payment.model';
import PaymentMethod from '../../models/paymentMethod.model';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import SellerProfile from '../../models/seller.model';
import SellerInventory from '../../models/sellerInventory.model';
import OrderStatus from '../../models/orderStatus.model';
import User from '../../models/user.model';
import { PaymentService } from '../payment/payment.service';
import {
  CheckoutInput,
  CheckoutResponse,
  OrderType,
} from '../../graphql/types/checkout.types';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Cart)
    private cartModel: typeof Cart,
    @InjectModel(CartItem)
    private cartItemModel: typeof CartItem,
    @InjectModel(Order)
    private orderModel: typeof Order,
    @InjectModel(OrderDetail)
    private orderDetailModel: typeof OrderDetail,
    @InjectModel(ShippingAddress)
    private shippingAddressModel: typeof ShippingAddress,
    @InjectModel(Product)
    private productModel: typeof Product,
    @InjectModel(ProductVariation)
    private productVariationModel: typeof ProductVariation,
    @InjectModel(SellerProfile)
    private sellerProfileModel: typeof SellerProfile,
    @InjectModel(SellerInventory)
    private sellerInventoryModel: typeof SellerInventory,
    private readonly paymentService: PaymentService,
    private readonly sequelize: Sequelize,
  ) {}

  private transformToOrderType(order: Order): OrderType {
    const plainOrder = order.get({ plain: true });

    return {
      order_id: plainOrder.order_id,
      user_id: plainOrder.user_id,
      customer_name: plainOrder.user?.name,
      shipping_address: plainOrder.shippingAddress
        ? {
            address_id: plainOrder.shippingAddress.address_id,
            user_id: plainOrder.shippingAddress.user_id,
            recipient_name: plainOrder.shippingAddress.recipient_name,
            street_address: plainOrder.shippingAddress.street_address,
            city: plainOrder.shippingAddress.city,
            state: plainOrder.shippingAddress.state,
            postal_code: plainOrder.shippingAddress.postal_code,
            country: plainOrder.shippingAddress.country,
            phone_number: plainOrder.shippingAddress.phone_number,
          }
        : null,
      payment: plainOrder.payment?.[0]
        ? {
            payment_id: plainOrder.payment[0].payment_id,
            order_id: plainOrder.payment[0].order_id,
            user_id: plainOrder.payment[0].user_id,
            method: plainOrder.payment[0].paymentMethod?.method_name,
            amount: plainOrder.payment[0].amount,
            currency: plainOrder.payment[0].currency,
            status: plainOrder.payment[0].status,
            transaction_id: plainOrder.payment[0].transaction_id,
            payment_date: plainOrder.payment[0].payment_date,
          }
        : null,
      status: plainOrder.status?.status_name || 'Unknown',
      subtotal: plainOrder.subtotal,
      tax: plainOrder.tax,
      discount: plainOrder.discount,
      total: plainOrder.total,
      created_at: plainOrder.created_at,
      updated_at: plainOrder.updated_at,
      order_details: plainOrder.orderDetails?.map((detail) => ({
        order_detail_id: detail.order_detail_id,
        order_id: detail.order_id,
        product: {
          product_id: detail.product.product_id,
          category_id: detail.product.category_id,
          brand_id: detail.product.brand_id,
          seller_id: detail.product.seller_id,
          seller_name: detail.product.seller?.user?.name,
          store_name: detail.product.seller?.store_name,
          category_name: detail.product.category?.category_name,
          brand_name: detail.product.brand?.brand_name,
          title: detail.product.title,
          price: detail.product.price,
          description: detail.product.description,
          image: detail.product.image,
          keywords: detail.product.keywords,
          stock_quantity: detail.product.stock_quantity,
          created_at: detail.product.created_at,
          updated_at: detail.product.updated_at,
          variations: detail.product.variations,
        },
        variation: detail.variation,
        seller: {
          seller_id: detail.seller.seller_id,
          store_name: detail.seller.store_name,
          store_description: detail.seller.store_description,
          logo_url: detail.seller.logo_url,
          banner_url: detail.seller.banner_url,
          commission_rate: detail.seller.commission_rate,
          payout_method: detail.seller.payout_method,
          payout_details: detail.seller.payout_details,
          total_sales: detail.seller.total_sales,
          total_revenue: detail.seller.total_revenue,
          rating: detail.seller.rating,
          created_at: detail.seller.created_at,
          updated_at: detail.seller.updated_at,
          user: {
            user_id: detail.seller.user.user_id,
            name: detail.seller.user.name,
            email: detail.seller.user.email,
            user_name: detail.seller.user.user_name,
            contact: detail.seller.user.contact,
            profile_image: detail.seller.user.profile_image,
            role_name: 'Seller',
            is_seller: true,
            created_at: detail.seller.user.created_at,
            updated_at: detail.seller.user.updated_at,
          },
        },
        quantity: detail.quantity,
        price: detail.price,
        commission: detail.commission,
        seller_earnings: detail.seller_earnings,
      })),
    };
  }

  private async updateSellerProfiles(
    orderDetails: OrderDetail[],
    transaction: Transaction,
  ): Promise<void> {
    for (const detail of orderDetails) {
      await this.sellerProfileModel.increment(
        {
          total_sales: detail.quantity,
          total_revenue: detail.seller_earnings,
        },
        {
          where: { seller_id: detail.seller_id },
          transaction,
        },
      );
    }
  }

  async processCheckout(
    userId: number,
    checkoutInput: CheckoutInput,
  ): Promise<CheckoutResponse> {
    const transaction = await this.sequelize.transaction();

    try {
      // 1. Get user's cart with items
      const cart = await this.cartModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: CartItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                include: [{ model: SellerProfile, as: 'seller' }],
              },
              { model: ProductVariation, as: 'variation' },
            ],
          },
        ],
        transaction,
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // 2. Validate inventory
      for (const item of cart.items) {
        const inventory = await this.sellerInventoryModel.findOne({
          where: {
            seller_id: item.product.seller.seller_id,
            product_id: item.product_id,
            variation_id: item.variation_id || null,
          },
          transaction,
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product: ${item.product.title}`,
          );
        }
      }

      // 3. Verify shipping address
      const shippingAddress = await this.shippingAddressModel.findOne({
        where: {
          address_id: checkoutInput.shipping_address_id,
          user_id: userId,
        },
        transaction,
      });

      if (!shippingAddress) {
        throw new BadRequestException('Invalid shipping address');
      }

      // 4. Calculate order totals
      const subtotal = cart.items.reduce(
        (sum, item) => sum + parseFloat(item.total_price.toString()),
        0,
      );
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;

      // 5. Create order
      const order = await this.orderModel.create(
        {
          user_id: userId,
          shipping_address_id: checkoutInput.shipping_address_id,
          status_id: 1, // Pending
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          discount: 0,
          total: parseFloat(total.toFixed(2)),
        },
        { transaction },
      );

      // 6. Create order details and update inventory
      const orderDetails = [];
      for (const item of cart.items) {
        const seller = await this.sellerProfileModel.findByPk(
          item.product.seller.seller_id,
          { transaction },
        );
        const commission = parseFloat(
          (item.total_price * (seller.commission_rate / 100)).toFixed(2),
        );
        const sellerEarnings = parseFloat(
          (item.total_price - commission).toFixed(2),
        );

        const orderDetail = await this.orderDetailModel.create(
          {
            order_id: order.order_id,
            product_id: item.product_id,
            variation_id: item.variation_id,
            seller_id: item.product.seller.seller_id,
            quantity: item.quantity,
            price: parseFloat(item.price.toString()),
            commission,
            seller_earnings: sellerEarnings,
          },
          { transaction },
        );

        orderDetails.push(orderDetail);

        // Update inventories
        await this.sellerInventoryModel.decrement(
          { quantity: item.quantity },
          {
            where: {
              seller_id: item.product.seller.seller_id,
              product_id: item.product_id,
              variation_id: item.variation_id || null,
            },
            transaction,
          },
        );

        await this.productModel.decrement(
          { stock_quantity: item.quantity },
          {
            where: { product_id: item.product_id },
            transaction,
          },
        );

        if (item.variation_id) {
          await this.productVariationModel.decrement(
            { stock_quantity: item.quantity },
            {
              where: { variation_id: item.variation_id },
              transaction,
            },
          );
        }
      }

      // 7. Update seller profiles
      await this.updateSellerProfiles(orderDetails, transaction);

      // 8. Process payment
      const { payment, isSuccessful } =
        await this.paymentService.processPayment(
          order.order_id,
          userId,
          checkoutInput.payment_method_id,
          order.total,
          transaction,
        );

      // 9. Update order status based on payment
      const newStatusId = isSuccessful ? 2 : 5; // 2: Processing, 5: Cancelled
      await order.update({ status_id: newStatusId }, { transaction });

      // 10. Handle failed payment
      if (!isSuccessful) {
        for (const item of cart.items) {
          await this.sellerInventoryModel.increment(
            { quantity: item.quantity },
            {
              where: {
                seller_id: item.product.seller.seller_id,
                product_id: item.product_id,
                variation_id: item.variation_id || null,
              },
              transaction,
            },
          );

          await this.productModel.increment(
            { stock_quantity: item.quantity },
            {
              where: { product_id: item.product_id },
              transaction,
            },
          );

          if (item.variation_id) {
            await this.productVariationModel.increment(
              { stock_quantity: item.quantity },
              {
                where: { variation_id: item.variation_id },
                transaction,
              },
            );
          }
        }

        throw new BadRequestException(
          'Payment failed. Order has been cancelled.',
        );
      }

      // 11. Clear cart on success
      await this.cartItemModel.destroy({
        where: { cart_id: cart.cart_id },
        transaction,
      });
      await cart.update({ total_price: 0 }, { transaction });

      await transaction.commit();

      // 12. Fetch complete order details
      const orderWithDetails = await this.orderModel.findOne({
        where: { order_id: order.order_id },
        include: [
          {
            model: OrderDetail,
            as: 'orderDetails',
            include: [
              { model: Product, as: 'product' },
              { model: ProductVariation, as: 'variation' },
              {
                model: SellerProfile,
                as: 'seller',
                include: [{ model: User, as: 'user', attributes: ['name'] }],
              },
            ],
          },
          { model: ShippingAddress, as: 'shippingAddress' },
          {
            model: Payment,
            as: 'payment',
            include: [{ model: PaymentMethod, as: 'paymentMethod' }],
          },
          { model: OrderStatus, as: 'status' },
        ],
      });

      const transformedOrder = this.transformToOrderType(orderWithDetails);

      return {
        success: true,
        message: 'Order placed successfully',
        order: transformedOrder,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        message: error.message || 'Checkout failed',
        order: null,
      };
    }
  }
}
