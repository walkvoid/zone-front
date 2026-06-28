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
import { $t } from '#/locales';

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
  const userName = row.username || row.nickname || '';
  Modal.confirm({
    content: $t('ui.actionMessage.deleteConfirm', [userName]),
    title: $t('ui.actionTitle.delete', [$t('system.user.name')]),
    onOk: async () => {
      const hideLoading = message.loading({
        content: $t('ui.actionMessage.deleting', [userName]),
        duration: 0,
        key: 'user_delete_msg',
      });
      const userId = row.id;
      if (userId === undefined || userId === null) return;
      try {
        await deleteUser(userId);
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [userName]),
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
    message.warning($t('system.user.passwordMinLength'));
    return;
  }
  const user = resetPasswordUser.value;
  const userId = user?.id;
  if (userId === undefined || userId === null) return;
  resetPasswordLoading.value = true;
  try {
    await resetPassword(userId, newPassword.value);
    message.success($t('system.user.resetPasswordSuccess'));
    resetPasswordVisible.value = false;
    onRefresh();
  } finally {
    resetPasswordLoading.value = false;
  }
}

function onToggleStatus(row: SystemUserApi.SystemUser) {
  const isEnabled = row.status === '1' || row.status === 'enabled';
  const newStatus = isEnabled ? 0 : 1;
  const userName = row.username || row.nickname || '';

  Modal.confirm({
    content: isEnabled
      ? $t('system.user.disableConfirm', [userName])
      : $t('system.user.enableConfirm', [userName]),
    title: isEnabled
      ? $t('system.user.disableTitle')
      : $t('system.user.enableTitle'),
    onOk: async () => {
      const userId = row.id;
      if (userId === undefined || userId === null) return;
      await updateUserStatus(userId, newStatus);
      message.success(
        isEnabled
          ? $t('system.user.disableSuccess')
          : $t('system.user.enableSuccess'),
      );
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
          {{ $t('system.user.createUser') }}
        </Button>
      </template>
      <template #action="{ row }">
        <div class="flex items-center justify-center gap-1">
          <Button size="small" type="link" @click="onEdit(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button size="small" type="link" danger @click="onDelete(row)">
            {{ $t('common.delete') }}
          </Button>
          <Button size="small" type="link" @click="onResetPassword(row)">
            {{ $t('system.user.resetPassword') }}
          </Button>
          <Button size="small" type="link" @click="onToggleStatus(row)">
            {{
              row.status === '1' || row.status === 'enabled'
                ? $t('system.user.disable')
                : $t('system.user.enable')
            }}
          </Button>
        </div>
      </template>
    </Grid>

    <Modal
      v-model:open="resetPasswordVisible"
      :confirm-loading="resetPasswordLoading"
      :title="$t('system.user.resetPassword')"
      @ok="handleResetPassword"
    >
      <p class="mb-3">
        {{
          $t('system.user.resetPasswordHint', [
            resetPasswordUser?.username || resetPasswordUser?.nickname || '',
          ])
        }}
      </p>
      <Input.Password
        v-model:value="newPassword"
        :placeholder="$t('system.user.resetPasswordPlaceholder')"
      />
    </Modal>
  </Page>
</template>
