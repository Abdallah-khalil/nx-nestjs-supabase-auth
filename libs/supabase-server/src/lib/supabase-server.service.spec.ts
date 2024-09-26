import { Test } from '@nestjs/testing';
import { SupabaseServerService } from './supabase-server.service';

describe('SupabaseServerService', () => {
  let service: SupabaseServerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SupabaseServerService],
    }).compile();

    service = module.get(SupabaseServerService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
