// src/graphql/types/user.types.ts
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => ID, { nullable: true })
  user_id: number;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  user_name: string;

  @Field({ nullable: true })
  contact: string;

  @Field({ nullable: true })
  profile_image?: string;

  @Field({ nullable: true })
  role_name: string;

  @Field({ nullable: true })
  is_seller: boolean;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;
}

@InputType()
export class SignUpInput {
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

  @Field()
  role_id: number;
}

@InputType()
export class UpdateUserProfileInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  user_name?: string;

  @Field({ nullable: true })
  contact?: string;

  @Field({ nullable: true })
  profile_image?: string;
}

@InputType()
export class LoginInput {
  @Field()
  user_name: string;

  @Field()
  password: string;
}

@ObjectType()
export class SignUpResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}

@ObjectType()
export class LoginResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  token?: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}

@ObjectType()
export class UpdateUserProfileResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}

@ObjectType()
export class ChangePasswordResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
