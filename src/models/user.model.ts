// src/models/user.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey,
  HasOne,
} from 'sequelize-typescript';
import Role from './role.model';
import SellerProfile from './seller.model';

@Table({
  tableName: 'users',
  timestamps: false,
})
export default class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  user_id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  user_name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  contact: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  profile_image: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  role_id: number;

  @BelongsTo(() => Role, { as: 'role' })
  role: Role;

  @HasOne(() => SellerProfile, { foreignKey: 'seller_id', as: 'sellerProfile' })
  sellerProfile: SellerProfile;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deleted_at: Date;

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
}
