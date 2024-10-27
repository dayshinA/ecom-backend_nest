import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BeforeUpdate,
  BelongsTo,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import User from './user.model';
import ShippingAddress from './shippingAddress.model';
import OrderStatus from './orderStatus.model';
import OrderDetail from './order_detail.model';
import Payment from './payment.model';
import Coupon from './coupon.model';
import OrderCoupon from './orderCoupon.model';

@Table({
  tableName: 'orders',
  timestamps: false,
})
export default class Order extends Model<Order> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  order_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  shipping_address_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  status_id: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  subtotal: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  tax: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  discount: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(order: Order) {
    order.updated_at = new Date();
  }

  @BelongsTo(() => User, { foreignKey: 'user_id', as: 'user' })
  user: User;

  @BelongsTo(() => ShippingAddress, {
    foreignKey: 'shipping_address_id',
    as: 'shippingAddress',
  })
  shippingAddress: ShippingAddress;

  @BelongsTo(() => OrderStatus, { foreignKey: 'status_id', as: 'status' })
  status: OrderStatus;

  @HasMany(() => OrderDetail, { foreignKey: 'order_id', as: 'orderDetails' })
  orderDetails: OrderDetail[];

  @HasMany(() => Payment, { foreignKey: 'order_id', as: 'payment' })
  payment: Payment[];

  @BelongsToMany(() => Coupon, () => OrderCoupon)
  coupons: Coupon[];
}
