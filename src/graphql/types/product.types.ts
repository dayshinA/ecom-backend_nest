// src/graphql/types/product.types.ts
import { ObjectType, Field, ID, InputType, Float, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class ProductVariationType {
  @Field(() => ID)
  variation_id: number;

  @Field(() => ID)
  product_id: number;

  @Field({ nullable: true })
  sku: string;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes: any;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock_quantity: number;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;
}

@ObjectType()
export class ProductType {
  @Field(() => ID)
  product_id: number;

  @Field(() => ID)
  category_id: number;

  @Field(() => ID)
  brand_id: number;

  @Field(() => ID)
  seller_id: number;

  @Field({ nullable: true })
  seller_name: string;

  @Field({ nullable: true })
  store_name: string;

  @Field({ nullable: true })
  category_name: string;

  @Field({ nullable: true })
  brand_name: string;

  @Field()
  title: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  image: string;

  @Field({ nullable: true })
  keywords: string;

  @Field(() => Int)
  stock_quantity: number;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;

  @Field(() => [ProductVariationType], { nullable: true })
  variations: ProductVariationType[];
}

@ObjectType()
export class InventoryItemType {
  @Field(() => ID)
  product_id: number;

  @Field(() => ID)
  category_id: number;

  @Field(() => ID)
  brand_id: number;

  @Field(() => ID)
  seller_id: number;

  @Field()
  title: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  image: string;

  @Field({ nullable: true })
  keywords: string;

  @Field(() => Int)
  stock_quantity: number;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;

  @Field(() => [ProductVariationType], { nullable: true })
  variations: ProductVariationType[];

  @Field({ nullable: true })
  category_name: string;

  @Field({ nullable: true })
  brand_name: string;

  @Field(() => Int)
  inventory_quantity: number;

  @Field(() => Int)
  low_stock_threshold: number;
}

@InputType()
export class CreateProductVariationInput {
  @Field({ nullable: true })
  sku: string;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: any;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock_quantity: number;
}

@InputType()
export class CreateProductInput {
  @Field(() => ID)
  category_id: number;

  @Field(() => ID)
  brand_id: number;

  @Field()
  title: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  description: string;

  @Field(() => GraphQLUpload, { nullable: true })
  image?: Promise<FileUpload>;

  @Field({ nullable: true })
  keywords: string;

  @Field(() => Int)
  stock_quantity: number;

  @Field(() => [CreateProductVariationInput], { nullable: true })
  variations?: CreateProductVariationInput[];
}

@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  product_id: number;

  @Field(() => ID, { nullable: true })
  category_id?: number;

  @Field(() => ID, { nullable: true })
  brand_id?: number;

  @Field({ nullable: true })
  title?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  image?: Promise<FileUpload>;

  @Field({ nullable: true })
  keywords?: string;

  @Field(() => Int, { nullable: true })
  stock_quantity?: number;
}

@InputType()
export class UpdateProductVariationInput {
  @Field(() => ID)
  variation_id: number;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: any;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => Int, { nullable: true })
  stock_quantity?: number;
}

@ObjectType()
export class ProductResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => ProductType, { nullable: true })
  product?: ProductType;
}

@ObjectType()
export class ProductsResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => [ProductType])
  products: ProductType[];
}

@ObjectType()
export class InventoryResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => [InventoryItemType])
  inventory: InventoryItemType[];
}
