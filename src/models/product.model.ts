// src/models/product.model.ts
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
import Category from './category.model';
import Brand from './brand.model';
import SellerProfile from './seller.model';
import ProductVariation from './productVariation.model';
import SellerInventory from './sellerInventory.model';

@Table({
  tableName: 'products',
  timestamps: false,
})
export default class Product extends Model<Product> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  product_id: number;

  @ForeignKey(() => Category)
  @Column({ type: DataType.BIGINT, allowNull: false })
  category_id: number;

  @ForeignKey(() => Brand)
  @Column({ type: DataType.BIGINT, allowNull: false })
  brand_id: number;

  @ForeignKey(() => SellerProfile)
  @Column({ type: DataType.BIGINT, allowNull: false })
  seller_id: number;

  @Column({ type: DataType.STRING(200), allowNull: false })
  title: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  price: number;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.STRING(255))
  image: string;

  @Column(DataType.TSVECTOR)
  keywords: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  stock_quantity: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(product: Product) {
    product.updated_at = new Date();
  }

  @HasMany(() => ProductVariation, {
    foreignKey: 'product_id',
    as: 'variations',
  })
  variations: ProductVariation[];

  @HasMany(() => SellerInventory, {
    foreignKey: 'product_id',
    as: 'inventories',
  })
  inventories: SellerInventory[];

  @BelongsTo(() => Category, { as: 'category' })
  category: Category;

  @BelongsTo(() => Brand, { as: 'brand' })
  brand: Brand;

  @BelongsTo(() => SellerProfile, { as: 'seller' })
  seller: SellerProfile;
}
