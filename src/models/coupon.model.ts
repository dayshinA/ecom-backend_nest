// src/models/coupon.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BeforeUpdate,
  BelongsToMany,
} from 'sequelize-typescript';
import Order from './order.model';
import OrderCoupon from './orderCoupon.model';

@Table({
  tableName: 'coupons',
  timestamps: false,
})
export default class Coupon extends Model<Coupon> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  coupon_id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  code: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    validate: { isIn: [['percentage', 'fixed']] },
  })
  discount_type: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  discount_value: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiration_date: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(coupon: Coupon) {
    coupon.updated_at = new Date();
  }

  @BelongsToMany(() => Order, () => OrderCoupon)
  orders: Order[];
}
