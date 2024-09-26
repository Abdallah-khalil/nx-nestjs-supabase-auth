import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseAuthResolver } from './supabase-auth.resolver';
import { SupabaseAuthService } from './supabase-auth.service';

describe('SupabaseAuthResolver', () => {
  let resolver: SupabaseAuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupabaseAuthResolver, SupabaseAuthService],
    }).compile();

    resolver = module.get<SupabaseAuthResolver>(SupabaseAuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
