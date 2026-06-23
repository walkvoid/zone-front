import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

export function useColumns(): VxeTableGridColumns<SystemUserApi.SystemUser> {
  return [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'username', title: '用户名', width: 150 },
    { field: 'nickname', title: '昵称', width: 150 },
    { field: 'phone', title: '手机号', width: 150 },
    { field: 'email', title: '邮箱', width: 200 },
    { field: 'gender', title: '性别', width: 80 },
    { field: 'status', title: '状态', width: 100 },
    { field: 'lastLoginTime', title: '最后登录', width: 180 },
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
