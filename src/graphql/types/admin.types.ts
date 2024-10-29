// src/graphql/types/admin.types.ts
import { Field, ID, ObjectType, InputType, Int } from '@nestjs/graphql';
import { UserType } from './user.types';
import { OrderType } from './checkout.types';
import { SellerProfileType } from './seller.types';

// Query Return Types
@ObjectType()
export class CreateAdminResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}

@ObjectType()
export class UpdateUserRoleResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}

@ObjectType()
export class OrderResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => OrderType, { nullable: true })
  order?: OrderType;
}

@ObjectType()
export class OrdersResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => [OrderType])
  orders: OrderType[];

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
export class AllUsersResponse {
  @Field(() => [UserType])
  users: UserType[];

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
export class AllCustomersResponse {
  @Field(() => [UserType])
  customers: UserType[];

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
export class SellerWithProfile {
  @Field(() => ID)
  user_id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  user_name: string;

  @Field()
  contact: string;

  @Field({ nullable: true })
  profile_image?: string;

  @Field()
  role_name: string;

  @Field()
  is_seller: boolean;

  @Field({ nullable: true })
  created_at?: Date;

  @Field({ nullable: true })
  updated_at?: Date;

  @Field(() => SellerProfileType, { nullable: true })
  sellerProfile?: SellerProfileType;
}

@ObjectType()
export class SellersWithProfileResponse {
  @Field(() => [SellerWithProfile])
  sellers: SellerWithProfile[];

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
export class AllSellersResponse {
  @Field(() => [UserType])
  sellers: UserType[];

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
export class DeleteUserResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

// Input Types
@InputType()
export class CreateAdminInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  user_name: string;

  @Field()
  password: string;

  @Field()
  contact: string;
}

// Additional Input Types for Queries/Mutations
@InputType()
export class GetOrdersInput {
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}

@InputType()
export class UpdateUserRoleInput {
  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  roleId: string;
}
