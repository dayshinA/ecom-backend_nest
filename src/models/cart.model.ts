// src/models/cart.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  HasMany,
  BeforeUpdate,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { CartItem } from './cartItem.model';
import { User } from './user.model';

@Table({
  tableName: 'carts',
  timestamps: false,
})
export class Cart extends Model<Cart> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  cart_id: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  user_id: number | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    unique: true,
  })
  session_id: string | null;

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

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  total_price: number;

  @HasMany(() => CartItem, { foreignKey: 'cart_id', as: 'items' })
  items: CartItem[];

  @BeforeUpdate
  static setUpdateTimestamp(cart: Cart) {
    cart.updated_at = new Date();
  }
}
