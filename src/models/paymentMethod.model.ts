// src/models/paymentMethod.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BeforeUpdate,
  HasMany,
} from 'sequelize-typescript';
import { Payment } from './payment.model';

@Table({
  tableName: 'payment_methods',
  timestamps: false,
})
export class PaymentMethod extends Model<PaymentMethod> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  method_id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  method_name: string;

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
  static updateTimestamp(paymentMethod: PaymentMethod) {
    paymentMethod.updated_at = new Date();
  }

  @HasMany(() => Payment, { foreignKey: 'method_id', as: 'payments' })
  payments: Payment[];
}
