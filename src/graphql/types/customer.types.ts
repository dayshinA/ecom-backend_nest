// src/graphql/types/customer.types.ts
// src/graphql/types/customer.types.ts
import { ObjectType, Field, ID, InputType, Float, Int } from '@nestjs/graphql';
import { OrderType } from './checkout.types';

@ObjectType()
export class CustomerOrdersResponse {
  @Field(() => [OrderType])
  orders: OrderType[];

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
export class OrderConnection {
  @Field(() => [OrderType])
  rows: OrderType[];

  @Field(() => Int)
  count: number;
}

// Optional: Pagination parameters input type for query
@InputType()
export class CustomerOrdersPaginationInput {
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}
