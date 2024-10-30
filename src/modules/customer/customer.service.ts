// src/modules/customer/customer.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import SellerProfile from '../../models/seller.model';
import User from '../../models/user.model';
import Order from '../../models/order.model';
import OrderDetail from '../../models/order_detail.model';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import ShippingAddress from '../../models/shippingAddress.model';
import Payment from '../../models/payment.model';
import PaymentMethod from '../../models/paymentMethod.model';
import OrderStatus from '../../models/orderStatus.model';
import { CustomerOrdersResponse } from 'src/graphql/types/customer.types';
import Category from '../../models/category.model';
import Brand from '../../models/brand.model';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
  ) {}

  private transformToOrderType(order: Order): any {
    const plainOrder = order.get({ plain: true });

    // Transform payment data
    const payment = plainOrder.payment?.[0];
    const transformedPayment = payment
      ? {
          payment_id: payment.payment_id,
          order_id: payment.order_id,
          user_id: payment.user_id,
          method: payment.paymentMethod?.method_name,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          transaction_id: payment.transaction_id,
          payment_date: payment.payment_date,
        }
      : null;

    // Transform order details
    const orderDetails = plainOrder.orderDetails?.map((detail) => ({
      order_detail_id: detail.order_detail_id,
      order_id: detail.order_id,
      product: {
        ...detail.product,
        seller_name: detail.product?.seller?.user?.name,
        store_name: detail.product?.seller?.store_name,
        category_name: detail.product?.category?.category_name,
        brand_name: detail.product?.brand?.brand_name,
      },
      variation: detail.variation,
      seller: detail.seller,
      quantity: detail.quantity,
      price: detail.price,
      commission: detail.commission,
      seller_earnings: detail.seller_earnings,
    }));

    return {
      order_id: plainOrder.order_id,
      user_id: plainOrder.user_id,
      customer_name: plainOrder.user?.name,
      shipping_address: plainOrder.shippingAddress,
      payment: transformedPayment,
      status: plainOrder.status?.status_name || plainOrder.status,
      subtotal: plainOrder.subtotal,
      tax: plainOrder.tax,
      discount: plainOrder.discount,
      total: plainOrder.total,
      created_at: plainOrder.created_at,
      updated_at: plainOrder.updated_at,
      order_details: orderDetails,
    };
  }

  async getCustomerOrders(
    userId: number,
    limit?: number,
    offset?: number,
  ): Promise<CustomerOrdersResponse> {
    try {
      const orders = await this.orderModel.findAndCountAll({
        where: { user_id: userId },
        limit: limit || 10,
        offset: offset || 0,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: OrderDetail,
            as: 'orderDetails',
            include: [
              {
                model: Product,
                as: 'product',
                include: [
                  {
                    model: Category,
                    as: 'category',
                    attributes: ['category_name'],
                  },
                  {
                    model: Brand,
                    as: 'brand',
                    attributes: ['brand_name'],
                  },
                  {
                    model: SellerProfile,
                    as: 'seller',
                    include: [
                      {
                        model: User,
                        as: 'user',
                      },
                    ],
                  },
                ],
              },
              {
                model: ProductVariation,
                as: 'variation',
              },
              {
                model: SellerProfile,
                as: 'seller',
                include: [{ model: User, as: 'user', attributes: ['name'] }],
              },
            ],
          },
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'name', 'email'],
          },
          {
            model: ShippingAddress,
            as: 'shippingAddress',
          },
          {
            model: Payment,
            as: 'payment',
            include: [
              {
                model: PaymentMethod,
                as: 'paymentMethod',
              },
            ],
          },
          {
            model: OrderStatus,
            as: 'status',
          },
        ],
      });

      const transformedOrders = orders.rows.map((order) =>
        this.transformToOrderType(order),
      );

      return {
        success: true,
        message: 'Orders fetched successfully',
        orders: transformedOrders,
        totalCount: orders.count,
      };
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return {
        success: false,
        message: 'Failed to fetch customer orders',
        orders: [],
        totalCount: 0,
      };
    }
  }
}
