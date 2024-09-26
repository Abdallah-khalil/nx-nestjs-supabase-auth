import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database } from '@nx-nestjs-supabase-stripe-starter/db';
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import {
  AuthError,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { Request, Response } from 'express';

export interface ExtendedUser extends User {
  id: string;
}

@Injectable()
export class SupabaseServerService {
  private supabaseClient!: SupabaseClient<Database>;

  public constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {}

  public getSupabaseClient({
    req,
    res,
  }: {
    req: Request;
    res?: Response | null;
  }): SupabaseClient<Database> {
    if (this.supabaseClient) {
      return this.supabaseClient;
    }

    this.supabaseClient = createServerClient<Database>(
      this.configService.get<string>('supabaseUrl') as string,
      this.configService.get<string>('supabaseKey') as string,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(req?.headers.cookie ?? '');
          },
          setAll(
            cookiesToSet: {
              name: string;
              value: string;
              options: object;
            }[]
          ) {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }: {
                name: string;
                value: string;
                options: object;
              }) =>
                res?.appendHeader(
                  'Set-Cookie',
                  serializeCookieHeader(name, value, options)
                )
            );
          },
        },
      }
    );

    return this.supabaseClient;
  }

  public async updateSupabaseAuthSession(
    refreshToken: string,
    idToken: string,
    req: Request & { user?: ExtendedUser }
  ) {
    const client: SupabaseClient<Database> = this.getSupabaseClient({
      req,
    });

    if (client == null) {
      this.logger.error(' supbase client has to be initialized  ');
    }
    const sessionDetails: {
      data: { session: Session | null };
      error: AuthError | null;
    } = await client.auth.getSession();

    if (!sessionDetails?.data?.session && refreshToken != null) {
      await this.refreshCurrentUserSession(client, refreshToken, idToken);
    } else {
      if (req.user?.id !== sessionDetails?.data?.session?.user?.id) {
        await this.refreshCurrentUserSession(client, refreshToken, idToken);
      }
    }
  }

  private async refreshCurrentUserSession(
    client: SupabaseClient<Database>,
    refreshToken: string,
    idToken: string
  ): Promise<void> {
    console.log('refreshing session ');

    await client.auth.refreshSession({
      refresh_token: refreshToken,
    });

    await client.auth.setSession({
      refresh_token: refreshToken,
      access_token: idToken,
    });
  }
}
