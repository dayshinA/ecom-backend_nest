// src/models/shippingAddress.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BeforeUpdate,
} from 'sequelize-typescript';
import User from './user.model';
import Order from './order.model';

@Table({
  tableName: 'shipping_addresses',
  timestamps: false,
})
export default class ShippingAddress extends Model<ShippingAddress> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  address_id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  recipient_name: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  street_address: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  city: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  state: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  postal_code: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  country: string;

  @Column({ type: DataType.STRING(20), allowNull: true })
  phone_number: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(address: ShippingAddress) {
    address.updated_at = new Date();
  }

  @BelongsTo(() => User, { as: 'user' })
  user: User;

  @HasMany(() => Order, { foreignKey: 'shipping_address_id', as: 'orders' })
  orders: Order[];
}
