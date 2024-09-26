import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { SupabaseServerModule } from '@nx-nestjs-supabase-stripe-starter/supabase-server';

@Module({
  providers: [UserResolver, UserService],
  exports: [UserService],
  imports: [SupabaseServerModule],
})
export class UserModule {}
