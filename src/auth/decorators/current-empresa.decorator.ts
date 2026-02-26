import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentEmpresa = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.empresa_id;
  },
);
