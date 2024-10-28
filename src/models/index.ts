// src/models/index.ts

import Role from './role.model';
import User from './user.model';
import SellerProfile from './seller.model';
import Category from './category.model';
import Product from './product.model';
import ProductVariation from './productVariation.model';
import SellerInventory from './sellerInventory.model';
import Brand from './brand.model';
import Cart from './cart.model';
import CartItem from './cartItem.model';
import Coupon from './coupon.model';
import Order from './order.model';
import OrderCoupon from './orderCoupon.model';
import OrderStatus from './orderStatus.model';
import OrderDetail from './order_detail.model';
import Payment from './payment.model';
import PaymentMethod from './paymentMethod.model';
import Review from './review.model';
import SellerAnalytics from './sellerAnalytics.model';
import SellerReview from './sellerReview.model';
import ShippingAddress from './shippingAddress.model';

// Export an array of all models
export const models = [
  Role,
  User,
  SellerProfile,
  Category,
  Product,
  ProductVariation,
  SellerInventory,
  Brand,
  Cart,
  CartItem,
  Coupon,
  Order,
  OrderCoupon,
  OrderStatus,
  OrderDetail,
  Payment,
  PaymentMethod,
  Review,
  SellerAnalytics,
  SellerReview,
  ShippingAddress,
];

// Also export individual models if needed
export {
  Role,
  User,
  SellerProfile,
  Category,
  Product,
  ProductVariation,
  SellerInventory,
  Brand,
  Cart,
  CartItem,
  Coupon,
  Order,
  OrderCoupon,
  OrderStatus,
  OrderDetail,
  Payment,
  PaymentMethod,
  Review,
  SellerAnalytics,
  SellerReview,
  ShippingAddress,
};
