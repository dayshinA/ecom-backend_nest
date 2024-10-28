// src/graphql/types/checkout.types.ts
// src/graphql/types/checkout.types.ts
import { ObjectType, Field, ID, InputType, Float, Int } from '@nestjs/graphql';
import { ProductType, ProductVariationType } from './product.types';
import { SellerProfileType } from './seller.types';

@InputType()
export class CheckoutInput {
  @Field(() => ID)
  shipping_address_id: number;

  @Field(() => ID)
  payment_method_id: number;
}

@InputType()
export class ShippingAddressInput {
  @Field()
  recipient_name: string;

  @Field()
  street_address: string;

  @Field()
  city: string;

  @Field({ nullable: true })
  state?: string;

  @Field()
  postal_code: string;

  @Field()
  country: string;

  @Field({ nullable: true })
  phone_number?: string;
}

@InputType()
export class PaymentMethodInput {
  @Field()
  method_name: string;
}

@ObjectType()
export class OrderDetailType {
  @Field(() => ID)
  order_detail_id: number;

  @Field(() => ID)
  order_id: number;

  @Field(() => ProductType)
  product: ProductType;

  @Field(() => ProductVariationType, { nullable: true })
  variation?: ProductVariationType;

  @Field(() => SellerProfileType)
  seller: SellerProfileType;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  commission: number;

  @Field(() => Float)
  seller_earnings: number;
}

@ObjectType()
export class ShippingAddressType {
  @Field(() => ID)
  address_id: number;

  @Field(() => ID)
  user_id: number;

  @Field()
  recipient_name: string;

  @Field()
  street_address: string;

  @Field()
  city: string;

  @Field({ nullable: true })
  state?: string;

  @Field()
  postal_code: string;

  @Field()
  country: string;

  @Field({ nullable: true })
  phone_number?: string;
}

@ObjectType()
export class PaymentType {
  @Field(() => ID)
  payment_id: number;

  @Field(() => ID)
  order_id: number;

  @Field(() => ID)
  user_id: number;

  @Field({ nullable: true })
  method?: string;

  @Field(() => Float)
  amount: number;

  @Field()
  currency: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  transaction_id?: string;

  @Field()
  payment_date: Date;
}

@ObjectType()
export class OrderType {
  @Field(() => ID)
  order_id: number;

  @Field(() => ID)
  user_id: number;

  @Field({ nullable: true })
  customer_name?: string;

  @Field(() => ShippingAddressType, { nullable: true })
  shipping_address?: ShippingAddressType;

  @Field(() => PaymentType, { nullable: true })
  payment?: PaymentType;

  @Field()
  status: string;

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  total: number;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => [OrderDetailType], { nullable: true })
  order_details?: OrderDetailType[];
}

@ObjectType()
export class CheckoutResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => OrderType, { nullable: true })
  order?: OrderType;
}

@ObjectType()
export class OrderStatusType {
  @Field(() => ID)
  status_id: number;

  @Field()
  status_name: string;
}

@ObjectType()
export class PaymentMethodType {
  @Field(() => ID)
  method_id: number;

  @Field()
  method_name: string;
}

@ObjectType()
export class ShippingAddressResponse {
  @Field(() => ShippingAddressType)
  shippingAddress: ShippingAddressType;
}

@ObjectType()
export class PaymentMethodResponse {
  @Field(() => PaymentMethodType)
  paymentMethod: PaymentMethodType;
}
