// src/modules/seller/seller.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FileUpload } from 'graphql-upload';
import SellerProfile from '../../models/seller.model';
import User from '../../models/user.model';
import Role from '../../models/role.model';
import Order from '../../models/order.model';
import OrderDetail from '../../models/order_detail.model';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import ShippingAddress from '../../models/shippingAddress.model';
import Payment from '../../models/payment.model';
import PaymentMethod from '../../models/paymentMethod.model';
import OrderStatus from '../../models/orderStatus.model';
import { CloudinaryService } from '../../config/cloudinary.config';
import {
  CreateSellerProfileInput,
  UpdateSellerProfileInput,
  SellerProfileResponse,
  UserOrdersResponse,
} from '../../graphql/types/seller.types';

@Injectable()
export class SellerService {
  constructor(
    @InjectModel(SellerProfile)
    private sellerProfileModel: typeof SellerProfile,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Role)
    private roleModel: typeof Role,
    @InjectModel(Order)
    private orderModel: typeof Order,
    @InjectModel(OrderDetail)
    private orderDetailModel: typeof OrderDetail,
    private readonly cloudinaryService: CloudinaryService,
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

  async createSellerProfile(
    userId: number,
    profileData: CreateSellerProfileInput,
  ): Promise<SellerProfileResponse> {
    try {
      const user = await this.userModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name'],
          },
        ],
      });

      if (!user || user.role.role_name !== 'Seller') {
        return {
          success: false,
          message: 'User is not a seller',
          sellerProfile: null,
        };
      }

      const existingProfile = await this.sellerProfileModel.findOne({
        where: { seller_id: userId },
      });

      if (existingProfile) {
        return {
          success: false,
          message: 'Seller profile already exists',
          sellerProfile: null,
        };
      }

      // Handle logo upload if provided
      let logoUrl: string | null = null;
      if (profileData.logo_url) {
        const file: FileUpload = await profileData.logo_url;
        const { createReadStream, filename } = file;
        const stream = createReadStream();
        const uploadResult = await this.cloudinaryService.uploadStoreImage(
          stream,
          filename,
        );
        logoUrl = uploadResult.secure_url;
      }

      // Handle banner upload if provided
      let bannerUrl: string | null = null;
      if (profileData.banner_url) {
        const file: FileUpload = await profileData.banner_url;
        const { createReadStream, filename } = file;
        const stream = createReadStream();
        const uploadResult = await this.cloudinaryService.uploadStoreImage(
          stream,
          filename,
        );
        bannerUrl = uploadResult.secure_url;
      }

      // Omit logo_url and banner_url from profileData when spreading
      const { logo_url, banner_url, ...profileDataWithoutFiles } = profileData;

      const newProfile = await this.sellerProfileModel.create(
        {
          seller_id: userId,
          ...profileDataWithoutFiles,
          logo_url: logoUrl,
          banner_url: bannerUrl,
        },
        {
          include: [
            {
              model: User,
              as: 'user',
              include: [
                {
                  model: Role,
                  as: 'role',
                  attributes: ['role_name'],
                },
              ],
            },
          ],
        },
      );

      return {
        success: true,
        message: 'Seller profile created successfully',
        sellerProfile: {
          ...newProfile.get({ plain: true }),
          user: {
            ...newProfile.user.get({ plain: true }),
            is_seller: true,
            role_name: newProfile.user.role.role_name,
          },
        },
      };
    } catch (error) {
      console.error('Error creating seller profile:', error);
      throw new BadRequestException('Failed to create seller profile');
    }
  }

  async updateSellerProfile(
    userId: number,
    profileData: UpdateSellerProfileInput,
  ): Promise<SellerProfileResponse> {
    try {
      const profile = await this.sellerProfileModel.findOne({
        where: { seller_id: userId },
      });

      if (!profile) {
        return {
          success: false,
          message: 'Seller profile not found',
          sellerProfile: null,
        };
      }

      // Handle logo upload if provided
      let logoUrl: string | undefined;
      if (profileData.logo_url) {
        const file: FileUpload = await profileData.logo_url;
        const { createReadStream, filename } = file;
        const stream = createReadStream();
        const uploadResult = await this.cloudinaryService.uploadStoreImage(
          stream,
          filename,
        );
        logoUrl = uploadResult.secure_url;
      }

      // Handle banner upload if provided
      let bannerUrl: string | undefined;
      if (profileData.banner_url) {
        const file: FileUpload = await profileData.banner_url;
        const { createReadStream, filename } = file;
        const stream = createReadStream();
        const uploadResult = await this.cloudinaryService.uploadStoreImage(
          stream,
          filename,
        );
        bannerUrl = uploadResult.secure_url;
      }

      await profile.update({
        ...profileData,
        ...(logoUrl && { logo_url: logoUrl }),
        ...(bannerUrl && { banner_url: bannerUrl }),
      });

      const updatedProfile = await this.sellerProfileModel.findOne({
        where: { seller_id: userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: [
              'user_id',
              'name',
              'email',
              'user_name',
              'contact',
              'profile_image',
              'created_at',
              'updated_at',
            ],
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['role_name'],
              },
            ],
          },
        ],
      });

      return {
        success: true,
        message: 'Seller profile updated successfully',
        sellerProfile: {
          ...updatedProfile.get({ plain: true }),
          user: {
            ...updatedProfile.user.get({ plain: true }),
            is_seller: true,
            role_name: updatedProfile.user.role.role_name,
          },
        },
      };
    } catch (error) {
      console.error('Error updating seller profile:', error);
      throw new BadRequestException('Failed to update seller profile');
    }
  }

  async getSellerProfile(userId: number): Promise<SellerProfileResponse> {
    try {
      const user = await this.userModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name'],
          },
        ],
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          sellerProfile: null,
        };
      }

      if (user.role.role_name !== 'Seller') {
        return {
          success: false,
          message: 'User is not a seller',
          sellerProfile: null,
        };
      }

      const profile = await this.sellerProfileModel.findOne({
        where: { seller_id: userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: [
              'user_id',
              'name',
              'email',
              'user_name',
              'contact',
              'profile_image',
              'created_at',
              'updated_at',
            ],
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['role_name'],
              },
            ],
          },
        ],
      });

      if (!profile) {
        return {
          success: false,
          message: 'Seller profile not set up',
          sellerProfile: null,
        };
      }

      const userWithIsSeller = {
        ...profile.user.get({ plain: true }),
        is_seller: true,
        role_name: profile.user.role.role_name,
      };
      delete userWithIsSeller.role;

      return {
        success: true,
        message: 'Seller profile fetched successfully',
        sellerProfile: {
          ...profile.get({ plain: true }),
          user: userWithIsSeller,
        },
      };
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      throw new BadRequestException('Failed to fetch seller profile');
    }
  }

  async getSellerOrders(
    sellerId: number,
    limit?: number,
    offset?: number,
  ): Promise<UserOrdersResponse> {
    try {
      const orders = await this.orderModel.findAndCountAll({
        limit: limit || 10,
        offset: offset || 0,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: OrderDetail,
            as: 'orderDetails',
            where: { seller_id: sellerId },
            include: [
              {
                model: Product,
                as: 'product',
                include: [
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
      console.error('Error fetching seller orders:', error);
      return {
        success: false,
        message: 'Failed to fetch seller orders',
        orders: [],
        totalCount: 0,
      };
    }
  }
}
