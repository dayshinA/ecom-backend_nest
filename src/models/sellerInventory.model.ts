// src/models/sellerInventory.model.ts
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
import { SellerProfile } from './seller.model';
import { Product } from './product.model';
import { ProductVariation } from './productVariation.model';

@Table({
  tableName: 'seller_inventory',
  timestamps: false,
})
export class SellerInventory extends Model<SellerInventory> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  inventory_id: number;

  @ForeignKey(() => SellerProfile)
  @Column({ type: DataType.BIGINT, allowNull: false })
  seller_id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.BIGINT, allowNull: false })
  product_id: number;

  @ForeignKey(() => ProductVariation)
  @Column({ type: DataType.BIGINT, allowNull: true })
  variation_id: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  quantity: number;

  @Column({ type: DataType.INTEGER, defaultValue: 10 })
  low_stock_threshold: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(inventory: SellerInventory) {
    inventory.updated_at = new Date();
  }

  @BelongsTo(() => Product, { as: 'product' })
  product: Product;

  @BelongsTo(() => ProductVariation, { as: 'variation' })
  variation: ProductVariation;

  @BelongsTo(() => SellerProfile, { as: 'seller' })
  seller: SellerProfile;
}
