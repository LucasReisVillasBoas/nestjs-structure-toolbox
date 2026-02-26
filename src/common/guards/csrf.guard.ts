import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SkipCsrfCheck = () => SetMetadata('skipCsrfCheck', true);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>('skipCsrfCheck', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest();
    const method = request.method.toUpperCase();

    // GET, HEAD, OPTIONS são safe methods — não precisam de proteção
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true;

    // Verificar header X-Requested-With
    const xRequestedWith = request.headers['x-requested-with'];
    if (xRequestedWith === 'XMLHttpRequest' || xRequestedWith === 'fetch') {
      return true;
    }

    // Verificar Origin/Referer
    const origin = request.headers.origin || request.headers.referer;
    if (origin && this.isValidOrigin(origin, request.headers.host)) {
      return true;
    }

    throw new ForbiddenException(
      'Possível ataque CSRF. Inclua o header X-Requested-With: XMLHttpRequest',
    );
  }

  private isValidOrigin(origin: string, host: string): boolean {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return true;
      // Permitir localhost em desenvolvimento
      if (
        process.env.NODE_ENV === 'development' &&
        (originHost.includes('localhost') || originHost.includes('127.0.0.1'))
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
