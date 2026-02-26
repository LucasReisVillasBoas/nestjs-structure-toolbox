import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionRequirement } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionRequirement[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // O perfil do usuário deve ter um campo 'permissoes' no formato:
    // { "usuarios": ["listar", "criar"], "financeiro": ["visualizar"] }
    const userPermissions = user.permissoes || {};

    // Lógica OR: usuário precisa ter ao menos uma das permissões requeridas
    const hasPermission = requiredPermissions.some((required) => {
      const modulePermissions = userPermissions[required.module] || [];
      return modulePermissions.includes(required.action);
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        'Você não tem permissão para realizar esta ação neste módulo',
      );
    }

    return true;
  }
}
