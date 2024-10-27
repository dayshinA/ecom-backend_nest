// src/models/review.model.ts
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
import Product from './product.model';
import User from './user.model';

@Table({
  tableName: 'reviews',
  timestamps: false,
})
export default class Review extends Model<Review> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  review_id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.BIGINT, allowNull: false })
  product_id: number;

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
  static updateTimestamp(review: Review) {
    review.updated_at = new Date();
  }

  @BelongsTo(() => User, { as: 'user' })
  user: User;

  @BelongsTo(() => Product, { as: 'product' })
  product: Product;
}
