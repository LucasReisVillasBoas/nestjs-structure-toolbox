import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentCliente = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.cliente_id;
  },
);
