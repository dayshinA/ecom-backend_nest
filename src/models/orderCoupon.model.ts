// src/models/orderCoupon.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BeforeUpdate,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Order from './order.model';
import Coupon from './coupon.model';

@Table({
  tableName: 'order_coupons',
  timestamps: false,
})
export default class OrderCoupon extends Model<OrderCoupon> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  order_coupon_id: number;

  @ForeignKey(() => Order)
  @Column({ type: DataType.BIGINT, allowNull: false })
  order_id: number;

  @ForeignKey(() => Coupon)
  @Column({ type: DataType.BIGINT, allowNull: false })
  coupon_id: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => Coupon)
  coupon: Coupon;

  @BeforeUpdate
  static updateTimestamp(orderCoupon: OrderCoupon) {
    orderCoupon.updated_at = new Date();
  }
}
