// src/graphql/types/review.types.ts
// src/graphql/types/review.types.ts
import { ObjectType, Field, ID, InputType, Float, Int } from '@nestjs/graphql';
import { UserType } from './user.types';
import { ProductType } from './product.types';

@ObjectType()
export class ReviewType {
  @Field(() => ID)
  review_id: number;

  @Field(() => ID)
  product_id: number;

  @Field(() => ID)
  user_id: number;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => ProductType, { nullable: true })
  product?: ProductType;
}

@ObjectType()
export class ReviewResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => ReviewType, { nullable: true })
  review?: ReviewType;
}

@ObjectType()
export class ReviewsResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => [ReviewType])
  reviews: ReviewType[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}

@ObjectType()
export class ProductRatingResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => Float)
  averageRating: number;

  @Field(() => Int)
  totalReviews: number;
}

@ObjectType()
export class AllReviewsResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => [ReviewType])
  reviews: ReviewType[];
}

@InputType()
export class CreateReviewInput {
  @Field(() => ID)
  productId: number;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;
}

@InputType()
export class UpdateReviewInput {
  @Field(() => ID)
  reviewId: number;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;
}
