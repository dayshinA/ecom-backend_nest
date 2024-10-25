// src/models/orderStatus.model.ts
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
import { Order } from './order.model';

@Table({
  tableName: 'order_statuses',
  timestamps: false,
})
export class OrderStatus extends Model<OrderStatus> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  status_id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  status_name: string;

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
  static updateTimestamp(status: OrderStatus) {
    status.updated_at = new Date();
  }

  @HasMany(() => Order, { foreignKey: 'status_id', as: 'orders' })
  orders: Order[];
}
