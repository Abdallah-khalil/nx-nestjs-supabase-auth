import { Logger, Module } from '@nestjs/common';
import { SupabaseAuthService } from './supabase-auth.service';
import { SupabaseAuthResolver } from './supabase-auth.resolver';
import {
  SupabaseServerModule,
  SupabaseServerService,
} from '@nx-nestjs-supabase-stripe-starter/supabase-server';
import { PassportModule } from '@nestjs/passport';
import { SupabaseAuthStrategy } from './strategies/supabase-passport.strategy';
import { UserModule } from '../user/user.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [SupabaseServerModule, PassportModule, UserModule],
  providers: [
    SupabaseAuthResolver,
    SupabaseAuthService,
    {
      provide: SupabaseAuthStrategy,
      useFactory: (
        supabase: SupabaseServerService,
        configService: ConfigService
      ) => {
        return new SupabaseAuthStrategy(supabase, configService);
      },
      inject: [SupabaseServerService, ConfigService],
    },
    Logger,
  ],
})
export class SupabaseAuthModule {}
