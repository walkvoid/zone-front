import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

import { $t } from '#/locales';

export function useColumns(): VxeTableGridColumns<SystemRoleApi.SystemRole> {
  return [
    { field: 'id', title: 'ID', width: 80 },
    {
      field: 'roleCode',
      title: $t('system.role.roleCode'),
      width: 150,
    },
    {
      field: 'roleName',
      title: $t('system.role.roleName'),
      width: 150,
    },
    {
      field: 'description',
      title: $t('system.role.description'),
      minWidth: 200,
    },
    {
      field: 'isSystem',
      title: $t('system.role.isSystem'),
      width: 100,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('system.role.operation'),
      width: 260,
    },
  ];
}
