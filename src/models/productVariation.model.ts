// src/models/productVariation.model.ts
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
import { Product } from './product.model';
import { SellerInventory } from './sellerinventory.model';

@Table({
  tableName: 'product_variations',
  timestamps: false,
})
export class ProductVariation extends Model<ProductVariation> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  variation_id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.BIGINT, allowNull: false })
  product_id: number;

  @Column({ type: DataType.STRING(50), unique: true })
  sku: string;

  @Column(DataType.JSONB)
  attributes: JSON;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  price: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  stock_quantity: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(variation: ProductVariation) {
    variation.updated_at = new Date();
  }

  @BelongsTo(() => Product, { as: 'product' })
  product: Product;

  @HasMany(() => SellerInventory, {
    foreignKey: 'variation_id',
    as: 'inventories',
  })
  inventories: SellerInventory[];
}
