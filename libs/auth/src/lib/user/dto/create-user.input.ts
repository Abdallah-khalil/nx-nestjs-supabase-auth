import { Field, InputType } from '@nestjs/graphql';
import { Tables, TablesInsert } from '@nx-nestjs-supabase-stripe-starter/db';
import { User } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
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
  public address?: string | null;

  @Field(() => String, {
    description: 'full name',
    name: 'fullName',
    nullable: true,
  })
  public fullName!: string | null;

  @Field(() => String, {
    description: 'stripe customer id',
    name: 'stripeCustomerId',
    nullable: true,
  })
  public stripeCustomerId?: string | null;

  public static mapToSupabase(
    createUserInput: CreateUserInput,
    userId: string
  ): TablesInsert<'users'> {
    return {
      profile_picture: createUserInput.profilePicture ?? null,
      address: createUserInput.address ?? null,
      full_name: createUserInput.fullName ?? null,
      id: userId ?? null,
      stripe_customer_id: createUserInput.stripeCustomerId ?? '',
    };
  }

  public static mapFromSupabase(user: Tables<'users'>): User {
    return {
      profilePicture: user.profile_picture ?? null,
      address: (user.address as string) ?? null,
      fullName: user.full_name ?? null,
      id: user.id ?? null,
      stripeCustomerId: user.stripe_customer_id ?? null,
    };
  }
}
