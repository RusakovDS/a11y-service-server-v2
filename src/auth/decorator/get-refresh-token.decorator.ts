import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetRefreshToken = createParamDecorator(
  (_: undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request?.cookies?.refresh_token;
  },
);
