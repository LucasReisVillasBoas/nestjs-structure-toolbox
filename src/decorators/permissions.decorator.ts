import { SetMetadata } from '@nestjs/common';

export interface PermissionRequirement {
  module: string;
  action: string;
}

// Decorator base — suporta múltiplas permissões com lógica OR
export const Permissions = (...permissions: PermissionRequirement[]) =>
  SetMetadata('permissions', permissions);

// Atalhos para ações CRUD
export const CanCreate = (module: string) => Permissions({ module, action: 'criar' });
export const CanEdit = (module: string) => Permissions({ module, action: 'editar' });
export const CanList = (module: string) => Permissions({ module, action: 'listar' });
export const CanDelete = (module: string) => Permissions({ module, action: 'excluir' });
export const CanView = (module: string) => Permissions({ module, action: 'visualizar' });
