import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => String, {
    description: 'image url for the profile',
    name: 'profilePicture',
    nullable: true,
  })
  public profilePicture!: string | null;

  @Field(() => String, {
    description: 'address',
    name: 'address',
    nullable: true,
  })
  public address!: string | null;

  @Field(() => String, {
    description: 'full name',
    name: 'fullName',
    nullable: true,
  })
  public fullName!: string | null;

  @Field(() => String, {
    description: 'primary key',
    name: 'id',
    nullable: true,
  })
  public id!: string;

  @Field(() => String, {
    description: 'stripe customer id',
    name: 'stripeCustomerId',
    nullable: true,
  })
  public stripeCustomerId!: string | null;
}
