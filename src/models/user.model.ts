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
} from 'sequelize-typescript';
import { Role } from './role.model';

@Table({
  tableName: 'users',
  timestamps: false,
})
export class User extends Model<User> {
  // user id
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  user_id: number;

  // user's name
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name: string;

  // user's email
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  email: string;

  // user's username
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  user_name: string;

  // user's password
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password: string;

  // user's contact
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  contact: string;

  // profile image
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  profile_image: string;

  // user's role id
  @ForeignKey(() => Role)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  role_id: number;

  @BelongsTo(() => Role, { as: 'role' })
  role: Role;

  // deleted_at
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deleted_at: Date;

  // created_at
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  // updated_at
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  updated_at: Date;
}
