// src/models/seller.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'seller_profiles',
  timestamps: false,
})
export class SellerProfile extends Model<SellerProfile> {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  seller_id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  store_name: string;

  @Column(DataType.TEXT)
  store_description: string;

  @Column(DataType.STRING(255))
  logo_url: string;

  @Column(DataType.STRING(255))
  banner_url: string;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 10.0,
  })
  commission_rate: number;

  @Column(DataType.STRING(50))
  payout_method: string;

  @Column(DataType.JSONB)
  payout_details: object;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  total_sales: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  total_revenue: number;

  @Column({
    type: DataType.DECIMAL(3, 2),
    defaultValue: 0,
  })
  rating: number;

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

  @BelongsTo(() => User, { as: 'user' })
  user: User;
}
