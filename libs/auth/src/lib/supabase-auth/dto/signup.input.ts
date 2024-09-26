import { Field, InputType } from '@nestjs/graphql';
import { CreateUserInput } from '../../user/dto/create-user.input';

@InputType()
export class SignupInput extends CreateUserInput {
  @Field(() => String, {
    description: 'email',
    name: 'email',
    nullable: true,
  })
  public email!: string;

  @Field(() => String, {
    description: 'password',
    name: 'password',
    nullable: true,
  })
  public password!: string;

  @Field(() => String, {
    description: 'phone number',
    name: 'phoneNumber',
    nullable: true,
  })
  public phone!: string;
}
