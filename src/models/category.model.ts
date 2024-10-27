// src/models/category.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  HasMany,
  BeforeUpdate,
} from 'sequelize-typescript';
import Product from './product.model';

@Table({
  tableName: 'categories',
  timestamps: false,
})
export default class Category extends Model<Category> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  category_id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  category_name: string;

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

  @HasMany(() => Product, { foreignKey: 'category_id', as: 'products' })
  products: Product[];

  @BeforeUpdate
  static setUpdateTimestamp(category: Category) {
    category.updated_at = new Date();
  }
}
