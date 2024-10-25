// src/models/brand.model.ts
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
import { Product } from './product.model';

@Table({
  tableName: 'brands',
  timestamps: false,
})
export class Brand extends Model<Brand> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  brand_id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  brand_name: string;

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

  @HasMany(() => Product, { foreignKey: 'brand_id', as: 'products' })
  products: Product[];

  // Hook to update 'updated_at' before each update
  @BeforeUpdate
  static setUpdateTimestamp(brand: Brand) {
    brand.updated_at = new Date();
  }
}
