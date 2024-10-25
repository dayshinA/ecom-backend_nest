// src/graphql/types/role.types.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class RoleType {
  @Field(() => ID)
  role_id: number;

  @Field()
  role_name: string;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;
}
