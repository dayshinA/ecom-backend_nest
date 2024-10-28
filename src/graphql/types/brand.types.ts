// src/graphql/types/brand.types.ts
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType()
export class BrandType {
  @Field(() => ID)
  brand_id: number;

  @Field()
  brand_name: string;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;
}

@InputType()
export class BrandInput {
  @Field()
  brand_name: string;
}

@InputType()
export class UpdateBrandInput {
  @Field(() => ID)
  brand_id: number;

  @Field()
  brand_name: string;
}

@InputType()
export class DeleteBrandInput {
  @Field(() => ID)
  brand_id: number;
}

@ObjectType()
export class CreateBrandResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => BrandType, { nullable: true })
  brand?: BrandType;
}

@ObjectType()
export class UpdateBrandResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => BrandType, { nullable: true })
  brand?: BrandType;
}

@ObjectType()
export class DeleteBrandResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
