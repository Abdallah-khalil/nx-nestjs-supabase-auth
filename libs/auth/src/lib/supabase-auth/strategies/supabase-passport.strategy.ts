import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtendedUser,
  SupabaseServerService,
} from '@nx-nestjs-supabase-stripe-starter/supabase-server';
import {
  AuthError,
  AuthUser,
  Session,
  UserResponse,
} from '@supabase/supabase-js';
import { Request } from 'express';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';

export type SupabaseAuthUser = AuthUser;

export class SupabaseAuthStrategy extends PassportStrategy(
  Strategy,
  'SUPABASE_AUTH'
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override success!: (user: any, info: any) => void;
  public override fail!: Strategy['fail'];

  public constructor(
    private readonly supabase: SupabaseServerService,
    readonly configService: ConfigService
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('supabaseJwtSecret'),
    });
  }

  public async validate(
    payload: SupabaseAuthUser | null
  ): Promise<SupabaseAuthUser | null> {
    if (payload) {
      this.success(payload, {});

      return payload;
    }

    this.fail('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    return null;
  }

  public override async authenticate(req: Request): Promise<void> {
    const extractor: JwtFromRequestFunction =
      ExtractJwt.fromAuthHeaderAsBearerToken();
    const idToken: string | null = extractor(req);
    const refreshToken: string | null = req.headers['refresh-token'] as string;

    if (idToken == null) {
      this.fail('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
      return;
    }

    const sessionDetails: {
      data: { session: Session | null };
      error: AuthError | null;
    } = await this.supabase.getSupabaseClient({ req: req }).auth.getSession();

    this.supabase
      .getSupabaseClient({ req: req })
      .auth.getUser(idToken)
      .then(async ({ data: { user } }: UserResponse) => {
        if (sessionDetails?.data?.session === null && refreshToken != null) {
          await this.supabase.updateSupabaseAuthSession(
            refreshToken,
            idToken,
            req as Request & { user?: ExtendedUser }
          );
        } else {
          if (user?.id !== sessionDetails?.data?.session?.user?.id) {
            await this.supabase.updateSupabaseAuthSession(
              refreshToken,
              idToken,
              req as Request & { user?: ExtendedUser }
            );
          }
        }
        return this.validate(user);
      })
      .catch((err: Error) => {
        this.fail(err.message, HttpStatus.UNAUTHORIZED);
      });
  }
}
