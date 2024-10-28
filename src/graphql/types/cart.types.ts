// src/graphql/types/cart.types.ts
// src/graphql/types/cart.types.ts
import { ObjectType, Field, ID, InputType, Float, Int } from '@nestjs/graphql';
import { ProductType, ProductVariationType } from './product.types';

@ObjectType()
export class CartItemType {
  @Field(() => ID)
  cart_item_id: number;

  @Field(() => ID)
  cart_id: number;

  @Field(() => ProductType)
  product: ProductType;

  @Field(() => ProductVariationType, { nullable: true })
  variation?: ProductVariationType;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  total_price: number;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;
}

@ObjectType()
export class CartType {
  @Field(() => ID)
  cart_id: number;

  @Field(() => ID, { nullable: true })
  user_id?: number;

  @Field({ nullable: true })
  session_id?: string;

  @Field(() => [CartItemType])
  items: CartItemType[];

  @Field(() => Float)
  total_price: number;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;
}

@InputType()
export class AddToCartInput {
  @Field(() => ID)
  product_id: number;

  @Field(() => ID, { nullable: true })
  variation_id?: number;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class UpdateCartItemInput {
  @Field(() => ID)
  cart_item_id: number;

  @Field(() => Int)
  quantity: number;
}

@ObjectType()
export class CartResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => CartType, { nullable: true })
  cart?: CartType;
}
