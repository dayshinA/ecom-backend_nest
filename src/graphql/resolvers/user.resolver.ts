// src/graphql/resolvers/user.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from '../../modules/user/user.service';
import { AuthGuard } from '../../middleware/auth.gurad';
import { createWriteStream } from 'fs';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { join } from 'path';
import {
  UserType,
  SignUpInput,
  LoginInput,
  UpdateUserProfileInput,
  ChangePasswordInput,
  SignUpResponse,
  LoginResponse,
  UpdateUserProfileResponse,
  ChangePasswordResponse,
} from '../types/user.types';

@Resolver(() => UserType)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserType, { nullable: true }) // Make sure to specify nullable
  @UseGuards(AuthGuard)
  async currentUser(@Context() context) {
    // If no user in context, return null
    if (!context.req.user) {
      return null;
    }

    try {
      return await this.userService.getUserById(context.req.user.user_id);
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  @Mutation(() => SignUpResponse)
  async signUp(@Args('input') input: SignUpInput): Promise<SignUpResponse> {
    return this.userService.createUser(input);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput) {
    return this.userService.loginUser(input);
  }

  // For protected mutations, add error handling
  @Mutation(() => UpdateUserProfileResponse)
  @UseGuards(AuthGuard)
  async updateUserProfile(
    @Context() context,
    @Args('input') input: UpdateUserProfileInput,
  ) {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
        user: null,
      };
    }
    return this.userService.updateUserProfile(context.req.user.user_id, input);
  }

  @Mutation(() => ChangePasswordResponse)
  @UseGuards(AuthGuard)
  async changePassword(
    @Context() context,
    @Args('input') input: ChangePasswordInput,
  ) {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    // Return the actual result from the service
    return this.userService.changePassword(context.req.user.user_id, input);
  }
}
