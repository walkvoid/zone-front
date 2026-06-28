import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { $t } from '#/locales';

export function useColumns(): VxeTableGridColumns<SystemUserApi.SystemUser> {
  return [
    { field: 'id', title: 'ID', width: 80 },
    {
      field: 'username',
      title: $t('system.user.name'),
      width: 150,
    },
    {
      field: 'nickname',
      title: $t('system.user.nickname'),
      width: 150,
    },
    {
      field: 'phone',
      title: $t('system.user.phone'),
      width: 150,
    },
    {
      field: 'email',
      title: $t('system.user.email'),
      width: 200,
    },
    {
      field: 'gender',
      title: $t('system.user.gender'),
      width: 80,
    },
    {
      field: 'status',
      title: $t('system.user.status'),
      width: 100,
    },
    {
      field: 'lastLoginTime',
      title: $t('system.user.lastLoginTime'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('system.user.operation'),
      width: 260,
    },
  ];
}
