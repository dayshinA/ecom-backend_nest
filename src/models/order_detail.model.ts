// src/models/order_detail.model.ts
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
import Product from './product.model';
import ProductVariation from './productVariation.model';
import SellerProfile from './seller.model';

@Table({
  tableName: 'order_details',
  timestamps: false,
})
export default class OrderDetail extends Model<OrderDetail> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  order_detail_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  order_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  product_id: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  variation_id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  seller_id: number;

  @Column({ type: DataType.INTEGER, allowNull: false, validate: { min: 1 } })
  quantity: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  price: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  commission: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  seller_earnings: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(orderDetail: OrderDetail) {
    orderDetail.updated_at = new Date();
  }

  @BelongsTo(() => Order, { foreignKey: 'order_id' })
  order: Order;

  @BelongsTo(() => Product, { foreignKey: 'product_id', as: 'product' })
  product: Product;

  @BelongsTo(() => ProductVariation, {
    foreignKey: 'variation_id',
    as: 'variation',
  })
  variation: ProductVariation;

  @BelongsTo(() => SellerProfile, { foreignKey: 'seller_id', as: 'seller' })
  seller: SellerProfile;
}
