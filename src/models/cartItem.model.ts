// src/models/cartItem.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  BeforeUpdate,
} from 'sequelize-typescript';
import { Cart } from './cart.model';
import { Product } from './product.model';
import { ProductVariation } from './productVariation.model';

@Table({
  tableName: 'cart_items',
  timestamps: false,
})
export class CartItem extends Model<CartItem> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  cart_item_id: number;

  @ForeignKey(() => Cart)
  @Column(DataType.BIGINT)
  cart_id: number;

  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @ForeignKey(() => ProductVariation)
  @Column(DataType.BIGINT)
  variation_id: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  quantity: number;

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
  price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  total_price: number;

  @BelongsTo(() => Cart, { foreignKey: 'cart_id' })
  cart: Cart;

  @BelongsTo(() => Product, { foreignKey: 'product_id', as: 'product' })
  product: Product;

  @BelongsTo(() => ProductVariation, {
    foreignKey: 'variation_id',
    as: 'variation',
  })
  variation: ProductVariation;

  @BeforeUpdate
  static setUpdateTimestamp(cartItem: CartItem) {
    cartItem.updated_at = new Date();
  }
}
