// src/models/role.model.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import User from './user.model';

@Table({
  tableName: 'roles',
  timestamps: false,
})
export default class Role extends Model<Role> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  role_id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  role_name: string;

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

  // Reference to User with HasMany
  @HasMany(() => User, 'role_id')
  users: User[];
}
