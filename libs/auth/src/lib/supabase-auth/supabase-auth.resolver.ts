import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { SupabaseAuthService } from './supabase-auth.service';
import { AuthResponseType } from './entities/user-session.entity';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { Request, Response } from 'express';

@Resolver(() => AuthResponseType)
export class SupabaseAuthResolver {
  public constructor(
    private readonly authSupabaseService: SupabaseAuthService
  ) {}

  @Mutation(() => AuthResponseType)
  public async signup(
    @Args('signupInput') signupInput: SignupInput,
    @Context() ctx: { req: Request; res: Response }
  ) {
    return this.authSupabaseService.signup(signupInput, ctx);
  }

  @Mutation(() => AuthResponseType)
  public async login(
    @Args('loginInput') loginInput: LoginInput,
    @Context() ctx: { req: Request; res: Response }
  ) {
    return this.authSupabaseService.login(loginInput, ctx);
  }
}
