# Nx Nestjs Supabase Stripe  Starter

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.


## Initial Setup

1- Create an nx library ( @nx/js )  that will hold the supabase instance and types 
` npx nx generate @nx/js:library --name=libs/db --bundler=esbuild  --projectNameAndRootFormat=as-provided --setParserOptionsProject=true `

2- Install the supabase package to access the supabase cli
` npm install supabase --save-dev`

3-  cd into the library and create a supabase project 
 ` cd libs/db` 
 `npx supabase init`

4-  add targets to the project to start the supabase server and the db container
  > Supabase uses docker so you need to have docker installed on your machine
  >  head over to the project.json file and add the following to the "targets" section
  ```
 "start": {
      "executor": "nx:run-commands",
      "options": {
        "command": "supabase start",
        "cwd": "libs/db"
      }
    },
    "stop": {
      "executor": "nx:run-commands",
      "options": {
        "command": "supabase stop",
        "cwd": "libs/db"
      }
    }
  ```
> we could also add start:db and stop:db scripts to our package.json scripts to start and stop the supabase server

` nx run db:start`
` nx run db:stop`

once the supabase server is running we can create the db and the schema from the supabase studio 
open the supabase studio in the browser  and go to the Table Editor tab and  generate the following tables 
but before that we will need to create some stripe enums to define the possible values for some of the columns in our tables
```
CREATE TYPE "public"."pricing_plan_interval" AS ENUM (
    'day',
    'week',
    'month',
    'year'
);
```
``` 
CREATE TYPE "public"."pricing_type" AS ENUM (
    'one_time',
    'recurring'
);
```
```
CREATE TYPE "public"."subscription_status" AS ENUM (
  'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid',
    'paused'
);
```

 1- users table ---> it will map supabase authentication to our db 
 2- stripe products table ---> it will hold the stripe product details
 3- stripe prices table ---> it will hold the stripe product prices details
 4- stripe subscriptions table ---> it will hold the stripe subscriptions details

after that we can define our RLS policies to secure our data 
```
CREATE POLICY "Allow public read-only access." ON "public"."prices" FOR SELECT USING (true);

CREATE POLICY "Allow public read-only access." ON "public"."products" FOR SELECT USING (true);

CREATE POLICY "Can only view own subs data." ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Can update own user data." ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));

CREATE POLICY "Can view own user data." ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));

```

now we can go back to our terminal and run the following command to save the changes we made in the studio and make our initial migration

` npm run  db:diff -- --diffName=<name>`

while we are there let's also generate our types from the db, we better add a new targets to our project.json file to generate the types on build

```
 "gen:db:types": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx supabase gen types --lang  typescript --local  > src/lib/db.types.ts",
        "cwd": "libs/db"
      }
    }
```

let's also add a script to our package.json to generate the types on build 
"db:gen:types": " npx nx run db:gen:db:types"

Next lets generate our nestjs api application that will consume our supabase nestjs service
`npx nx generate @nx/nest:application --name=apps/api --projectNameAndRootFormat=as-provided --setParserOptionsProject=true --strict=true`

now our api app will only act as a shell and will include only the configuration for our keys and the main app module only, so let's remove all the other boilerplate code it generated and keep only the main app module.

lets  install cross-env `npm i -D cross-env` and add a folder named env in the root of the workspace ( Make sure to add it to .gitignore ) 
then create 2 files in the env folder .env.dev and .env.prod to hold our environment variables for the development and production environments
supabase provide the keys in the project settings tab in the supabase studio for the production  app 
for our local development project we can get the keys from the console that being printed out when we start the supabase server

```
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_URL=http://127.0.0.1:54321
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

```
then install nestjs config package `npm install @nestjs/config`
create a config.ts file in the src/app folder to hold our configuration for the nestjs application  and add the following code to it 
```
export interface ConfigProps {
  supabaseKey: string;
  supabaseServiceKey: string;
  supabaseUrl: string;
  supabaseJwtSecret?: string;

}

export const config: () => ConfigProps = (): ConfigProps => ({
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET ,
  supabaseKey: process.env.SUPABASE_KEY ,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ,
  supabaseUrl: process.env.SUPABASE_URL ,

});
```

then lets register the configuration service in the app module open the app.module.ts file and inside the imports array add the following 
```
    ConfigModule.forRoot({
      envFilePath: `env/.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      load: [config],
    }),

```
 we will be passing the NODE_ENV variable from the command using cross-env so before we forget about it lets add it to the package.json scripts 
     "api:start": "cross-env NODE_ENV=dev npx nx run api:serve",
    "api:prod:start": "cross-env NODE_ENV=prod npx nx run api:serve"



next lets generate our nestjs supabase library that will hold our supabase nestjs service using @supabase ssr so lets' install that first
` npm install @supabase/ssr` we will also install @supabase/supabase-js to have the supabase client in our library


now we can generate the library
`npx nx generate @nx/nest:library --name=supabase-server --projectNameAndRootFormat=as-provided --service=true --setParserOptionsProject=true --no-interactive  `

Next we need to setup our nestjs supabase service to use the supabase ssr client that we will call from our api application. 
open the supabase-server.service.ts file and import the supabase ssr client and initialize it with the supabase anon key

first define a variable that will hold the supabaseClient and also inject the config service in the constructor
```
  private supabaseClient!: SupabaseClient<Database>;

  public constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}
``` 

then define a method that will initialize the supabaseClient with the supabase ssr client and the supabase url

```
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
            }[],
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
                  serializeCookieHeader(name, value, options),
                ),
            );
          },
        },
      },
    );

    return this.supabaseClient;
  }
  ```

Next we will install and use  graphql to create a graphql api and use supabase authentication in our api to register and log in users 
`npm install @nestjs/graphql @nestjs/apollo`

then in our app module we will add the following imports 
```
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(
        process.cwd(),
        'apps/hive-builder-api/src/app/schema.gql',
      ),
      driver: ApolloDriver,
      include: [],
      playground: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    
```
we need to define the context to get the req and res objects in our graphql resolvers and pass it to our supabase service to get the supabase client.

now lets create a new nestjs library for authentication 
`npx nx generate @nx/nest:library --name=auth --projectNameAndRootFormat=as-provided --setParserOptionsProject=true`

next we will generate 2 nestjs resources one for the supabase-auth and one for the user we have in our database 
`npx nx generate @nx/nest:resource --name=supabase-auth/supabase-auth --nameAndDirectoryFormat=as-provided --type=graphql-code-first `
`npx nx generate @nx/nest:resource --name=user/user --nameAndDirectoryFormat=as-provided --type=graphql-code-first `

let's start by the user resource and edit the following files:
1- dto > create-user.input.ts  -- >  let's add the following code to the file 
( code from the create-user.input.ts file in the user resource )

2- dto> update-user.input.ts  -- >  let's add the following code to the file 
( code from the update-user.input.ts file in the user resource )

3- entity> user.entity.ts  -- >  let's add the following code to the file 
( code from the user.entity.ts file in the user resource )

4- resolver> user.resolver.ts  -- >  let's add the following code to the file 
( code from the user.resolver.ts file in the user resource )

5- service> user.service.ts  -- >  let's add the following code to the file 
( code from the user.service.ts file in the user resource )

6- module> user.module.ts  -- >  let's add the following code to the file 
( code from the user.module.ts file in the user resource )

Now let's move to the supabase-auth resource and edit the following files:

we will be using passport js to handle our authentication logic and integrate it with supabase auth through @nestjs/passport and passport-jwt. 

so let's install the packages 
`npm install @nestjs/passport passport-jwt`

then let's create our supabase passport strategy in the auth library, create a new folder named strategies and add the following code to the supabase.strategy.ts file

one issue we will need to fix is making sure that the supabase auth session is updated when it's expired, we will need to create a new method in the supabase-auth service to handle that and also make sure the user who makes the request is the same user in the session.

so first head over to the supabase-server.service.ts file and add the following method to update the supabase auth session

```
  public async updateSupabaseAuthSession(
    refreshToken: string,
    idToken: string,
    req: Request & { user?: ExtendedUser }
  ) {
    const client: SupabaseClient<Database> = this.getSupabaseClient({
      req,
    });

    if (client == null) {
      this.logger.error(' supabase client has to be initialized  ');
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

```

now copy this code to the supabase-passport.strategy.ts file in the auth library
```

import { HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtendedUser, SupabaseServerService } from '@nx-nestjs-supabase-stripe-starter/supabase-server';
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
  'SUPABASE_AUTH',
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override success!: (user: any, info: any) => void;
  public override fail!: Strategy['fail'];

  public constructor(private readonly supabase: SupabaseServerService) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env['JWT_SECRET'],
    });
  }

  public async validate(
    payload: SupabaseAuthUser | null,
  ): Promise<SupabaseAuthUser | null> {
    if (payload) {
      this.success(payload, {});

      return payload;
    }

    this.fail('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    return null;
  }

  public override async authenticate(
    req: Request, 
  ): Promise<void> {
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
            req as Request & { user?: ExtendedUser },
          );
        } else {
          if (user?.id !== sessionDetails?.data?.session?.user?.id) {
            await this.supabase.updateSupabaseAuthSession(
              refreshToken,
              idToken,
              req as Request & { user?: ExtendedUser },
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

```

then lets register the supabase passport strategy in the auth module we are injecting the supabase server service in the constructor of the strategy so we will need to add the following code to the supabase-auth.module.ts file

```
import { Module } from '@nestjs/common';
import { SupabaseAuthService } from './supabase-auth.service';
import { SupabaseAuthResolver } from './supabase-auth.resolver';
import {
  SupabaseServerModule,
  SupabaseServerService,
} from '@nx-nestjs-supabase-stripe-starter/supabase-server';
import { PassportModule } from '@nestjs/passport';
import { SupabaseAuthStrategy } from './strategies/supabase-passport.strategy';

@Module({
  imports: [SupabaseServerModule, PassportModule,UserModule],
  providers: [
    SupabaseAuthResolver,
    SupabaseAuthService,
    {
      provide: SupabaseAuthStrategy,
      useFactory: (supabase: SupabaseServerService) => {
        return new SupabaseAuthStrategy(supabase);
      },
      inject: [SupabaseServerService],
    },
  ],
})
export class SupabaseAuthModule {}
```

next up we will create the dto for the login and signup mutations and the return type for the graphql api, inside our dto folder create a login.dto.ts file and add the following code to it 
```
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field(() => String, {
    description: 'email',
    name: 'email',
    nullable: true,
  })
  public email!: string;

  @Field(() => String, {
    description: 'password',
    name: 'password',
    nullable: true,
  })
  public password!: string;
}
```
and another file for the signup mutation input  signup.input.ts and add the following code to it 
```
import { Field, InputType } from '@nestjs/graphql';
import { CreateUserInput } from '../../user/dto/create-user.input';

@InputType()
export class SignupInput extends CreateUserInput {
  @Field(() => String, {
    description: 'email',
    name: 'email',
    nullable: true,
  })
  public email!: string;

  @Field(() => String, {
    description: 'password',
    name: 'password',
    nullable: true,
  })
  public password!: string;

  @Field(() => String, {
    description: 'phone number',
    name: 'phoneNumber',
    nullable: true,
  })
  public phone!: string;
}

```

lastly we will need to define the shape of our signup and login response model, so inside our entity folder we will create a new file user-session.entity.ts and add the following code to it 
```
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class AuthSessionType {
  @Field(() => String, {
    name: 'accessToken',
    nullable: true,
  })
  public access_token!: string | null;

  @Field(() => String, {
    name: 'refreshToken',
    nullable: true,
  })
  public refresh_token!: string | null;
}

@ObjectType()
export class AuthUserType {
  @Field(() => String, {
    description: 'email',
    name: 'email',
    nullable: true,
  })
  public email!: string | null;

  @Field(() => String, {
    description: 'phone',
    name: 'phone',
    nullable: true,
  })
  public phone!: string | null;
}

@ObjectType()
export class AuthResponseType {
  @Field(() => AuthSessionType, {
    name: 'authSession',
    nullable: false,
  })
  public authSession!: AuthSessionType;

  @Field(() => AuthUserType, {
    name: 'authUser',
    nullable: false,
  })
  public authUser!: AuthUserType;

  @Field(() => User, {
    name: 'user',
    nullable: false,
  })
  public user!: User;
}
```
