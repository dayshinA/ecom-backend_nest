// src/graphql/resolvers/user.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class UserResolver {
  @Query(() => String)
  sayHello(): string {
    return 'Hello from GraphQL!';
  }
}
