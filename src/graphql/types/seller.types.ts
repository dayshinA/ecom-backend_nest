// src/graphql/types/seller.types.ts
import { ObjectType, Field, ID, InputType, Float, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { UserType } from './user.types';
import { OrderType } from './checkout.types';

@ObjectType()
export class SellerProfileType {
  @Field(() => ID)
  seller_id: number;

  @Field(() => UserType)
  user: UserType;

  @Field()
  store_name: string;

  @Field({ nullable: true })
  store_description?: string;

  @Field({ nullable: true })
  logo_url?: string;

  @Field({ nullable: true })
  banner_url?: string;

  @Field(() => Float)
  commission_rate: number;

  @Field({ nullable: true })
  payout_method?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  payout_details?: any;

  @Field(() => Float)
  total_sales: number;

  @Field(() => Float)
  total_revenue: number;

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field({ nullable: true })
  created_at?: Date;

  @Field({ nullable: true })
  updated_at?: Date;
}

@InputType()
export class CreateSellerProfileInput {
  @Field()
  store_name: string;

  @Field({ nullable: true })
  store_description?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  logo_url?: Promise<FileUpload>;

  @Field(() => GraphQLUpload, { nullable: true })
  banner_url?: Promise<FileUpload>;

  @Field(() => Float, { nullable: true })
  commission_rate?: number;

  @Field({ nullable: true })
  payout_method?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  payout_details?: any;
}

@InputType()
export class UpdateSellerProfileInput {
  @Field({ nullable: true })
  store_name?: string;

  @Field({ nullable: true })
  store_description?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  logo_url?: Promise<FileUpload>;

  @Field(() => GraphQLUpload, { nullable: true })
  banner_url?: Promise<FileUpload>;

  @Field(() => Float, { nullable: true })
  commission_rate?: number;

  @Field({ nullable: true })
  payout_method?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  payout_details?: any;
}

@ObjectType()
export class SellerProfileResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => SellerProfileType, { nullable: true })
  sellerProfile?: SellerProfileType;
}

@ObjectType()
export class UserOrdersResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => [OrderType])
  orders: OrderType[];

  @Field(() => Int)
  totalCount: number;
}
