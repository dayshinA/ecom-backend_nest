// src/graphql/types/sellerReview.types.ts
// src/graphql/types/sellerReview.types.ts
import { ObjectType, Field, ID, InputType, Int } from '@nestjs/graphql';
import { UserType } from './user.types';
import { SellerProfileType } from './seller.types';

@ObjectType()
export class SellerReviewType {
  @Field(() => ID)
  review_id: number;

  @Field(() => ID)
  seller_id: number;

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

  @Field(() => SellerProfileType, { nullable: true })
  seller?: SellerProfileType;
}

@ObjectType()
export class SellerReviewResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => SellerReviewType, { nullable: true })
  review?: SellerReviewType;
}

@ObjectType()
export class SellerReviewsResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => [SellerReviewType])
  reviews: SellerReviewType[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}

@ObjectType()
export class SellerRatingResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field()
  averageRating: string;

  @Field(() => Int)
  totalReviews: number;
}

@InputType()
export class CreateSellerReviewInput {
  @Field(() => ID)
  sellerId: number;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;
}

@InputType()
export class UpdateSellerReviewInput {
  @Field(() => ID)
  reviewId: number;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;
}

@InputType()
export class SellerReviewsQueryInput {
  @Field(() => ID)
  sellerId: number;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}

@InputType()
export class SellerRatingQueryInput {
  @Field(() => ID)
  sellerId: number;
}
