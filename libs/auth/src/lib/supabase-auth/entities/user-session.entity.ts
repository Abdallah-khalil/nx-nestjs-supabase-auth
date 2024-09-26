import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class AuthSessionType {
  @Field(() => String, {
    name: 'accessToken',
    nullable: true,
  })
  public access_token!: string | null;

  @Field(() => String, {
    name: 'refreshToken',
    nullable: true,
  })
  public refresh_token!: string | null;
}

@ObjectType()
export class AuthUserType {
  @Field(() => String, {
    description: 'email',
    name: 'email',
    nullable: true,
  })
  public email!: string | null;

  @Field(() => String, {
    description: 'phone',
    name: 'phone',
    nullable: true,
  })
  public phone!: string | null;
}

@ObjectType()
export class AuthResponseType {
  @Field(() => AuthSessionType, {
    name: 'authSession',
    nullable: false,
  })
  public authSession!: AuthSessionType;

  @Field(() => AuthUserType, {
    name: 'authUser',
    nullable: false,
  })
  public authUser!: AuthUserType;

  @Field(() => User, {
    name: 'user',
    nullable: false,
  })
  public user!: User;
}
