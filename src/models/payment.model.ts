// src/models/payment.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BeforeUpdate,
  BelongsTo,
} from 'sequelize-typescript';
import Order from './order.model';
import User from './user.model';
import PaymentMethod from './paymentMethod.model';

@Table({
  tableName: 'payments',
  timestamps: false,
})
export default class Payment extends Model<Payment> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  payment_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  order_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  method_id: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  amount: number;

  @Column({ type: DataType.CHAR(3), allowNull: false })
  currency: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  status: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  transaction_id: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  payment_date: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(payment: Payment) {
    payment.updated_at = new Date();
  }

  @BelongsTo(() => Order, { foreignKey: 'order_id', as: 'order' })
  order: Order;

  @BelongsTo(() => User, { foreignKey: 'user_id', as: 'user' })
  user: User;

  @BelongsTo(() => PaymentMethod, {
    foreignKey: 'method_id',
    as: 'paymentMethod',
  })
  paymentMethod: PaymentMethod;
}
