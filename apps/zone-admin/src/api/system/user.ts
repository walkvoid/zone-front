import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id?: number;
    username?: string;
    password?: string;
    phone?: string;
    email?: string;
    nickname?: string;
    avatar?: string;
    gender?: string;
    birthday?: string;
    status?: string;
    lastLoginTime?: string;
    lastLoginIp?: string;
  }
}

/**
 * 获取用户列表
 */
async function getUserList() {
  return requestClient.get<Array<SystemUserApi.SystemUser>>('/user/list');
}

/**
 * 创建用户
 */
async function createUser(data: SystemUserApi.SystemUser) {
  return requestClient.post('/user', data);
}

/**
 * 更新用户
 */
async function updateUser(data: SystemUserApi.SystemUser) {
  return requestClient.put('/user', data);
}

/**
 * 删除用户
 */
async function deleteUser(id: number) {
  return requestClient.delete(`/user/${id}`);
}

/**
 * 批量删除用户
 */
async function batchDeleteUser(ids: number[]) {
  return requestClient.delete('/user/batch', { data: { ids } });
}

/**
 * 启用/禁用用户
 */
async function updateUserStatus(id: number, status: number) {
  return requestClient.put(`/user/${id}/status`, null, { params: { status } });
}

/**
 * 重置密码
 */
async function resetPassword(id: number, password: string) {
  return requestClient.put(`/user/${id}/reset-password`, { password });
}

export {
  batchDeleteUser,
  createUser,
  deleteUser,
  getUserList,
  resetPassword,
  updateUser,
  updateUserStatus,
};
