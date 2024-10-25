// src/models/sellerReview.model.ts
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
import { User } from './user.model';

@Table({
  tableName: 'seller_reviews',
  timestamps: false,
})
export class SellerReview extends Model<SellerReview> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  review_id: number;

  @ForeignKey(() => SellerProfile)
  @Column({ type: DataType.BIGINT, allowNull: false })
  seller_id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  rating: number;

  @Column(DataType.TEXT)
  comment: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;

  @BeforeUpdate
  static updateTimestamp(review: SellerReview) {
    review.updated_at = new Date();
  }

  @BelongsTo(() => SellerProfile, { as: 'seller' })
  seller: SellerProfile;

  @BelongsTo(() => User, { as: 'user' })
  user: User;
}
