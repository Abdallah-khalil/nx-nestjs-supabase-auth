import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator =
  createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const ctx: GqlExecutionContext = GqlExecutionContext.create(context);

    return ctx.getContext().req.user;
  });
