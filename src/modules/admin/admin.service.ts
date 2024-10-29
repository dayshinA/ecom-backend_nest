// src/modules/admin/admin.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import User from '../../models/user.model';
import Role from '../../models/role.model';
import SellerProfile from '../../models/seller.model';
import Order from '../../models/order.model';
import OrderDetail from '../../models/order_detail.model';
import OrderStatus from '../../models/orderStatus.model';
import ShippingAddress from '../../models/shippingAddress.model';
import Payment from '../../models/payment.model';
import PaymentMethod from '../../models/paymentMethod.model';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import Category from '../../models/category.model';
import Brand from '../../models/brand.model';
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
} from '../../graphql/types/admin.types';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Role)
    private roleModel: typeof Role,
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

  async createAdmin(adminData: CreateAdminInput): Promise<CreateAdminResponse> {
    try {
      const { password, ...otherData } = adminData;
      const hashedPassword = await bcrypt.hash(password, 10);

      const adminRole = await this.roleModel.findOne({
        where: { role_name: 'Admin' },
      });
      if (!adminRole) {
        return {
          success: false,
          message: 'Admin role not found',
          user: null,
        };
      }

      const newAdmin = await this.userModel.create({
        ...otherData,
        password: hashedPassword,
        role_id: adminRole.role_id,
      });

      const createdAdmin = await this.getUserById(newAdmin.user_id);
      return {
        success: true,
        message: 'Admin created successfully',
        user: {
          ...createdAdmin,
          role_name: 'Admin',
          is_seller: false,
        },
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        if (error.errors[0].path === 'email') {
          return {
            success: false,
            message: 'Email already exists',
            user: null,
          };
        } else if (error.errors[0].path === 'user_name') {
          return {
            success: false,
            message: 'Username already exists',
            user: null,
          };
        }
      }
      throw new BadRequestException('Failed to create admin');
    }
  }

  async getAllUsers(): Promise<AllUsersResponse> {
    try {
      const result = await this.userModel.findAndCountAll({
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name'],
          },
        ],
        attributes: { exclude: ['password'] },
      });

      const users = result.rows.map((user) => {
        const plainUser = user.get({ plain: true });
        return {
          ...plainUser,
          role_name: plainUser.role?.role_name || null,
          is_seller: plainUser.role?.role_name === 'Seller' || false,
        };
      });

      return {
        users,
        totalCount: result.count,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch users');
    }
  }

  async getCustomers(): Promise<AllCustomersResponse> {
    try {
      const result = await this.userModel.findAndCountAll({
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name'],
            where: { role_name: 'Customer' },
          },
        ],
        attributes: { exclude: ['password'] },
      });

      const customers = result.rows.map((customer) => {
        const plainCustomer = customer.get({ plain: true });
        return {
          ...plainCustomer,
          role_name: 'Customer',
          is_seller: false,
        };
      });

      return {
        customers,
        totalCount: result.count,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch customers');
    }
  }

  async getSellers(): Promise<AllSellersResponse> {
    try {
      const result = await this.userModel.findAndCountAll({
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name'],
            where: { role_name: 'Seller' },
          },
          {
            model: SellerProfile,
            as: 'sellerProfile',
          },
        ],
        attributes: { exclude: ['password'] },
      });

      const sellers = result.rows.map((seller) => {
        const plainSeller = seller.get({ plain: true });
        return {
          ...plainSeller,
          role_name: 'Seller',
          is_seller: true,
        };
      });

      return {
        sellers,
        totalCount: result.count,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch sellers');
    }
  }

  async getSellersWithProfile(): Promise<SellersWithProfileResponse> {
    try {
      const result = await this.userModel.findAndCountAll({
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name'],
            where: { role_name: 'Seller' },
          },
          {
            model: SellerProfile,
            as: 'sellerProfile',
            required: true,
          },
        ],
        attributes: { exclude: ['password'] },
      });

      const sellers = result.rows.map((seller) => {
        const plainSeller = seller.get({ plain: true });
        const sellerProfile = plainSeller.sellerProfile;

        // Transform seller profile to match SellerProfileType
        const transformedProfile = {
          seller_id: sellerProfile.seller_id,
          user: {
            user_id: plainSeller.user_id,
            name: plainSeller.name,
            email: plainSeller.email,
            user_name: plainSeller.user_name,
            contact: plainSeller.contact,
            profile_image: plainSeller.profile_image,
            role_name: 'Seller',
            is_seller: true,
            created_at: plainSeller.created_at,
            updated_at: plainSeller.updated_at,
          },
          store_name: sellerProfile.store_name,
          store_description: sellerProfile.store_description,
          logo_url: sellerProfile.logo_url,
          banner_url: sellerProfile.banner_url,
          commission_rate: sellerProfile.commission_rate,
          payout_method: sellerProfile.payout_method,
          payout_details: sellerProfile.payout_details,
          total_sales: sellerProfile.total_sales,
          total_revenue: sellerProfile.total_revenue,
          rating: sellerProfile.rating,
          created_at: sellerProfile.created_at,
          updated_at: sellerProfile.updated_at,
        };

        // Transform seller to match SellerWithProfile
        return {
          user_id: plainSeller.user_id,
          name: plainSeller.name,
          email: plainSeller.email,
          user_name: plainSeller.user_name,
          contact: plainSeller.contact,
          profile_image: plainSeller.profile_image,
          role_name: 'Seller',
          is_seller: true,
          created_at: plainSeller.created_at,
          updated_at: plainSeller.updated_at,
          sellerProfile: transformedProfile,
        };
      });

      return {
        sellers,
        totalCount: result.count,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch sellers with profiles');
    }
  }

  async getAllOrders({
    limit = 10,
    offset = 0,
  }: GetOrdersInput): Promise<OrdersResponse> {
    try {
      const orders = await this.orderModel.findAndCountAll({
        limit,
        offset,
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
            include: [{ model: PaymentMethod, as: 'paymentMethod' }],
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
      throw new BadRequestException('Failed to fetch orders');
    }
  }

  async getOrderById(orderId: number): Promise<OrderResponse> {
    try {
      const order = await this.orderModel.findOne({
        where: { order_id: orderId },
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
            include: [{ model: PaymentMethod, as: 'paymentMethod' }],
          },
          {
            model: OrderStatus,
            as: 'status',
          },
        ],
      });

      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          order: null,
        };
      }

      return {
        success: true,
        message: 'Order fetched successfully',
        order: this.transformToOrderType(order),
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch order');
    }
  }

  async updateUserRole({
    userId,
    roleId,
  }: UpdateUserRoleInput): Promise<UpdateUserRoleResponse> {
    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          user: null,
        };
      }

      const role = await this.roleModel.findByPk(roleId);
      if (!role) {
        return {
          success: false,
          message: 'Role not found',
          user: null,
        };
      }

      await user.update({ role_id: parseInt(roleId) }); // Convert roleId to number
      const updatedUser = await this.getUserById(parseInt(userId));

      return {
        success: true,
        message: 'User role updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      throw new BadRequestException('Failed to update user role');
    }
  }

  async deleteUser(userId: number): Promise<DeleteUserResponse> {
    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      await user.destroy();
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }

  async getUserById(userId: number) {
    const user = await this.userModel.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['role_name'],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plainUser = user.get({ plain: true });
    return {
      ...plainUser,
      role_name: plainUser.role?.role_name || null,
      is_seller: plainUser.role?.role_name === 'Seller' || false,
    };
  }
}
