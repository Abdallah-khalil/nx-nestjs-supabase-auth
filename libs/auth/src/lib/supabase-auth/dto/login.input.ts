import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
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
}
