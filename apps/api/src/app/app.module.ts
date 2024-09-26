import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import {
  SupabaseAuthModule,
  UserModule,
} from '@nx-nestjs-supabase-stripe-starter/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `env/.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      load: [config],
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(process.cwd(), 'apps/api/src/app/schema.gql'),
      driver: ApolloDriver,
      include: [SupabaseAuthModule, UserModule],
      playground: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    SupabaseAuthModule,
    UserModule,
  ],
})
export class AppModule {}
