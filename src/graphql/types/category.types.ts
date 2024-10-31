// src/graphql/types/category.types.ts
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType()
export class CategoryType {
  @Field(() => ID)
  category_id: number;

  @Field()
  category_name: string;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;
}

@InputType()
export class CategoryInput {
  @Field()
  category_name: string;
}

@InputType()
export class UpdateCategoryInput {
  @Field(() => ID)
  category_id: number;

  @Field()
  category_name: string;
}

@InputType()
export class DeleteCategoryInput {
  @Field(() => ID)
  category_id: number;
}

@ObjectType()
export class CategoryResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => CategoryType, { nullable: true })
  category?: CategoryType;
}

@ObjectType()
export class DeleteCategoryResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
