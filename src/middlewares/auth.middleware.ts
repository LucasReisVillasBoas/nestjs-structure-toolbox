import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import { RequestContext } from '@mikro-orm/core';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private readonly em: EntityManager,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // RequestContext garante isolamento do EntityManager por request
    await RequestContext.create(this.em, async () => {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token não fornecido');
      }

      const token = authHeader.split(' ')[1];

      try {
        const payload = await this.jwtService.verifyAsync(token);

        // Injetar dados do usuário no request
        req['user'] = {
          id: payload.sub,
          email: payload.email,
          empresa_id: payload.empresa_id,
          cliente_id: payload.cliente_id,
        };

        next();
      } catch (error) {
        throw new UnauthorizedException('Token inválido ou expirado');
      }
    });
  }
}
