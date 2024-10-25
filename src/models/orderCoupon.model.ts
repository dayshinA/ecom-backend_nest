// src/models/orderCoupon.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BeforeUpdate,
} from 'sequelize-typescript';
import { Order } from './order.model';
import { Coupon } from './coupon.model';

@Table({
  tableName: 'order_coupons',
  timestamps: false,
})
export class OrderCoupon extends Model<OrderCoupon> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  order_coupon_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  order_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  coupon_id: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(orderCoupon: OrderCoupon) {
    orderCoupon.updated_at = new Date();
  }
}
