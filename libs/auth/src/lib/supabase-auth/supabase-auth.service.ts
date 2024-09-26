import { Injectable, Logger } from '@nestjs/common';
import { Tables, TablesInsert } from '@nx-nestjs-supabase-stripe-starter/db';
import {
  ExtendedUser,
  SupabaseServerService,
} from '@nx-nestjs-supabase-stripe-starter/supabase-server';
import {
  AuthResponse,
  AuthSession,
  AuthTokenResponsePassword,
  User,
} from '@supabase/supabase-js';
import { CreateUserInput } from '../user/dto/create-user.input';
import { UserService } from '../user/user.service';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';
import { Request, Response } from 'express';

@Injectable()
export class SupabaseAuthService {
  private authUser: User | null = null;
  private dbUser: Tables<'users'> | null = null;

  public constructor(
    private readonly userService: UserService,
    private readonly supabaseClient: SupabaseServerService,
    private readonly logger: Logger
  ) {}

  public async signup(
    signupInput: SignupInput,
    ctx: { req: Request; res: Response }
  ) {
    try {
      const { user, session }: { user: User; session: AuthSession } =
        await this.createSupabaseAuthUser(signupInput, ctx);

      if (user !== null) {
        this.authUser = user;

        const userModel: TablesInsert<'users'> = CreateUserInput.mapToSupabase(
          signupInput,
          user.id
        );

        this.dbUser = await this.createDbUser(userModel, ctx);

        return {
          authSession: session,
          authUser: user,
          user: CreateUserInput.mapFromSupabase(this.dbUser),
        };
      }
    } catch (error) {
      await this.rollback(ctx);
      throw error;
    }

    return null;
  }

  public async login(
    loginInput: LoginInput,
    ctx: { req: Request; res: Response }
  ) {
    const { error, data }: AuthTokenResponsePassword = await this.supabaseClient
      .getSupabaseClient({ req: ctx.req })
      .auth.signInWithPassword({
        email: loginInput.email,
        password: loginInput.password,
      });

    if (error != null) {
      // this.errorHandler.handleError(error);
    }

    if (data?.user !== null) {
      this.logger.log('Supabase auth user Has Logged In ', data.user.email);

      await this.supabaseClient.updateSupabaseAuthSession(
        data.session.refresh_token,
        data.session.access_token,
        ctx.req as Request & { user?: ExtendedUser }
      );

      const dbUser: Tables<'users'> = await this.userService.findOne(
        data.user.id,
        ctx
      );

      this.logger.log('User Found in DB', JSON.stringify(dbUser.id));
      return {
        authSession: data.session,
        authUser: data.user,
        user: CreateUserInput.mapFromSupabase(dbUser),
      };
    }

    return null;
  }

  private async createDbUser(
    userModel: TablesInsert<'users'>,
    ctx: { req: Request; res: Response }
  ) {
    const dbUser: Tables<'users'> = await this.userService.create(
      {
        ...userModel,
      },
      ctx
    );

    this.logger.log('User created', JSON.stringify(dbUser));
    return dbUser;
  }

  private async createSupabaseAuthUser(
    signupInput: SignupInput,
    ctx: { req: Request; res: Response }
  ) {
    const { error, data }: AuthResponse = await this.supabaseClient
      .getSupabaseClient({ req: ctx.req })
      .auth.signUp({
        email: signupInput.email,
        password: signupInput.password,
        phone: signupInput.phone,
      });

    if (error != null) {
      this.logger.error('Error creating supabase auth user', error);
      throw error;
    }

    this.logger.log('Supabase auth user has been added', data.user?.id);

    return { user: data.user as User, session: data.session as AuthSession };
  }

  private async rollback(ctx: { req: Request; res: Response }) {
    if (this.authUser) {
      await this.supabaseClient
        .getSupabaseClient({ req: ctx.req })
        .auth.admin.deleteUser(this.authUser.id);
      this.logger.log('Supabase auth user has been deleted', this.authUser.id);
    }

    if (this.dbUser) {
      await this.userService.remove(this.dbUser.id, ctx);
    }
  }
}
