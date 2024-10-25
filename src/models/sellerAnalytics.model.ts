// src/models/sellerAnalytics.model.ts
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

@Table({
  tableName: 'seller_analytics',
  timestamps: false,
})
export class SellerAnalytics extends Model<SellerAnalytics> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  analytics_id: number;

  @ForeignKey(() => SellerProfile)
  @Column({ type: DataType.BIGINT, allowNull: false })
  seller_id: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date: Date;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  orders_count: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  products_sold: number;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0 })
  revenue: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  views: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  unique_visitors: number;

  @Column({ type: DataType.DECIMAL(5, 2), defaultValue: 0 })
  conversion_rate: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(analytics: SellerAnalytics) {
    analytics.updated_at = new Date();
  }

  @BelongsTo(() => SellerProfile, { as: 'seller' })
  seller: SellerProfile;
}
