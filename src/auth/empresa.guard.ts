import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class EmpresaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const empresaId = request.params.empresaId || request.body.empresa_id;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!empresaId) {
      // Se não há empresa_id na request, permitir (será validado em outro lugar)
      return true;
    }

    // Verificar se o usuário tem acesso à empresa
    if (user.empresa_id !== empresaId) {
      throw new ForbiddenException('Você não tem acesso a esta empresa');
    }

    return true;
  }
}
