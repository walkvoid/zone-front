import type { VxePageResult } from '#/api/types/page';

import { requestClient } from '#/api/request';
import { fetchPage } from '#/api/types/page';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id?: number;
    roleCode?: string;
    roleName?: string;
    description?: string;
    isSystem?: string;
  }

  export interface MenuItem {
    id?: number;
    name?: string;
    menuCode?: string;
    menuName?: string;
    url?: string;
    menuType?: string;
    parentId?: number;
  }
}

/**
 * 获取角色列表（全量）
 */
async function getRoleList() {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>('/role/list');
}

/**
 * 分页查询角色列表
 */
async function getRolePage(params: {
  currentPage: number;
  pageSize: number;
  parameter?: Partial<SystemRoleApi.SystemRole>;
}): Promise<VxePageResult<SystemRoleApi.SystemRole>> {
  return fetchPage<SystemRoleApi.SystemRole>(
    '/role/page',
    params.currentPage,
    params.pageSize,
    params.parameter,
  );
}

/**
 * 创建角色
 */
async function createRole(data: SystemRoleApi.SystemRole) {
  return requestClient.post('/role', data);
}

/**
 * 更新角色
 */
async function updateRole(data: SystemRoleApi.SystemRole) {
  return requestClient.put('/role', data);
}

/**
 * 删除角色
 */
async function deleteRole(id: number) {
  return requestClient.delete(`/role/${id}`);
}

/**
 * 批量删除角色
 */
async function batchDeleteRole(ids: number[]) {
  return requestClient.delete('/role/batch', { data: { ids } });
}

/**
 * 查询角色的菜单ID列表
 */
async function getRoleMenus(roleId: number) {
  return requestClient.get<number[]>(`/role/${roleId}/menus`);
}

/**
 * 为角色分配菜单
 */
async function assignRoleMenus(roleId: number, menuIds: number[]) {
  return requestClient.post(`/role/${roleId}/menus/assign`, { menuIds });
}

export {
  assignRoleMenus,
  batchDeleteRole,
  createRole,
  deleteRole,
  getRoleList,
  getRoleMenus,
  getRolePage,
  updateRole,
};
