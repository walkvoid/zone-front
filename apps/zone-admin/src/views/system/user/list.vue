<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Input, message, Modal } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteUser,
  getUserList,
  resetPassword,
  updateUserStatus,
} from '#/api/system/user';

import { useColumns } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async () => {
          return await getUserList();
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
  } as VxeTableGridOptions,
});

// 重置密码相关状态
const resetPasswordVisible = ref(false);
const resetPasswordLoading = ref(false);
const resetPasswordUser = ref<null | SystemUserApi.SystemUser>(null);
const newPassword = ref('');

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onEdit(row: SystemUserApi.SystemUser) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemUserApi.SystemUser) {
  Modal.confirm({
    content: `确定要删除用户「${row.username || row.nickname || ''}」吗？此操作不可恢复。`,
    title: '删除确认',
    onOk: async () => {
      const hideLoading = message.loading({
        content: '正在删除...',
        duration: 0,
        key: 'user_delete_msg',
      });
      try {
        await deleteUser(row.id!);
        message.success({
          content: '删除成功',
          key: 'user_delete_msg',
        });
        onRefresh();
      } catch {
        hideLoading();
      }
    },
  });
}

function onResetPassword(row: SystemUserApi.SystemUser) {
  resetPasswordUser.value = row;
  newPassword.value = '';
  resetPasswordVisible.value = true;
}

async function handleResetPassword() {
  if (!newPassword.value || newPassword.value.length < 6) {
    message.warning('密码至少6个字符');
    return;
  }
  resetPasswordLoading.value = true;
  try {
    await resetPassword(resetPasswordUser.value!.id!, newPassword.value);
    message.success('密码重置成功');
    resetPasswordVisible.value = false;
    onRefresh();
  } finally {
    resetPasswordLoading.value = false;
  }
}

function onToggleStatus(row: SystemUserApi.SystemUser) {
  const isEnabled = row.status === '1' || row.status === 'enabled';
  const newStatus = isEnabled ? 0 : 1;
  const actionText = isEnabled ? '禁用' : '启用';

  Modal.confirm({
    content: `确定要${actionText}用户「${row.username || row.nickname || ''}」吗？`,
    title: `${actionText}确认`,
    onOk: async () => {
      await updateUserStatus(row.id!, newStatus);
      message.success(`${actionText}成功`);
      onRefresh();
    },
  });
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增用户
        </Button>
      </template>
      <template #action="{ row }">
        <div class="flex items-center justify-center gap-1">
          <Button size="small" type="link" @click="onEdit(row)">编辑</Button>
          <Button size="small" type="link" danger @click="onDelete(row)">
            删除
          </Button>
          <Button size="small" type="link" @click="onResetPassword(row)">
            重置密码
          </Button>
          <Button size="small" type="link" @click="onToggleStatus(row)">
            {{
              row.status === '1' || row.status === 'enabled' ? '禁用' : '启用'
            }}
          </Button>
        </div>
      </template>
    </Grid>

    <!-- 重置密码弹窗 -->
    <Modal
      v-model:open="resetPasswordVisible"
      title="重置密码"
      :confirm-loading="resetPasswordLoading"
      @ok="handleResetPassword"
    >
      <p class="mb-3">
        为用户「{{
          resetPasswordUser?.username || resetPasswordUser?.nickname || ''
        }}」设置新密码：
      </p>
      <Input.Password
        v-model:value="newPassword"
        placeholder="请输入新密码（至少6个字符）"
      />
    </Modal>
  </Page>
</template>
