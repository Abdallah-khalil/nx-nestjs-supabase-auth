import { Logger, Module } from '@nestjs/common';
import { SupabaseServerService } from './supabase-server.service';

@Module({
  controllers: [],
  providers: [SupabaseServerService, Logger],
  exports: [SupabaseServerService],
})
export class SupabaseServerModule {}
