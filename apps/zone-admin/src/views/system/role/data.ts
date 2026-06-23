import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

export function useColumns(): VxeTableGridColumns<SystemRoleApi.SystemRole> {
  return [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'roleCode', title: '角色编码', width: 150 },
    { field: 'roleName', title: '角色名称', width: 150 },
    { field: 'description', title: '描述', minWidth: 200 },
    { field: 'isSystem', title: '系统角色', width: 100 },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 260,
    },
  ];
}
