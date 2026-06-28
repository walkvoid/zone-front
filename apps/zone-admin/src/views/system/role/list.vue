<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu';
import type { SystemRoleApi } from '#/api/system/role';

import { ref, watch } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal, Tree } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMenuList } from '#/api/system/menu';
import {
  assignRoleMenus,
  deleteRole,
  getRoleList,
  getRoleMenus,
} from '#/api/system/role';
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
          return await getRoleList();
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

const menuDrawerVisible = ref(false);
const menuDrawerRole = ref<null | SystemRoleApi.SystemRole>(null);
type MenuTreeNode = {
  children?: MenuTreeNode[];
  key: string;
  title: string;
};

const menuTreeData = ref<MenuTreeNode[]>([]);
const checkedMenuKeys = ref<string[]>([]);
const menuLoading = ref(false);

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onEdit(row: SystemRoleApi.SystemRole) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemRoleApi.SystemRole) {
  const roleName = row.roleName || row.roleCode || '';
  Modal.confirm({
    content: $t('ui.actionMessage.deleteConfirm', [roleName]),
    title: $t('ui.actionTitle.delete', [$t('system.role.name')]),
    onOk: async () => {
      const hideLoading = message.loading({
        content: $t('ui.actionMessage.deleting', [roleName]),
        duration: 0,
        key: 'role_delete_msg',
      });
      const roleId = row.id;
      if (roleId === undefined || roleId === null) return;
      try {
        await deleteRole(roleId);
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [roleName]),
          key: 'role_delete_msg',
        });
        onRefresh();
      } catch {
        hideLoading();
      }
    },
  });
}

function convertMenuToTreeData(
  menus: SystemMenuApi.SystemMenu[],
): MenuTreeNode[] {
  return menus.map((menu) => {
    const node: MenuTreeNode = {
      key: String(menu.id),
      title: menu.menuName || menu.meta?.title || menu.name || '',
    };
    if (menu.children && menu.children.length > 0) {
      node.children = convertMenuToTreeData(menu.children);
    }
    return node;
  });
}

async function onMenuAssign(row: SystemRoleApi.SystemRole) {
  menuDrawerRole.value = row;
  menuDrawerVisible.value = true;
  menuLoading.value = true;
  try {
    const roleId = row.id;
    if (roleId === undefined || roleId === null) return;
    const [menus, roleMenuIds] = await Promise.all([
      getMenuList(),
      getRoleMenus(roleId),
    ]);
    menuTreeData.value = convertMenuToTreeData(menus);
    checkedMenuKeys.value = (roleMenuIds || []).map(String);
  } catch {
    message.error($t('system.role.menuLoadFailed'));
  } finally {
    menuLoading.value = false;
  }
}

async function handleMenuAssignSave() {
  if (!menuDrawerRole.value) return;
  const hideLoading = message.loading({
    content: $t('system.role.menuAssigning'),
    duration: 0,
    key: 'menu_assign_msg',
  });
  const roleId = menuDrawerRole.value.id;
  if (roleId === undefined || roleId === null) return;
  try {
    await assignRoleMenus(roleId, checkedMenuKeys.value.map(Number));
    message.success({
      content: $t('system.role.menuAssignSuccess'),
      key: 'menu_assign_msg',
    });
    menuDrawerVisible.value = false;
    onRefresh();
  } catch {
    hideLoading();
  }
}

watch(menuDrawerVisible, (val) => {
  if (!val) {
    menuTreeData.value = [];
    checkedMenuKeys.value = [];
    menuDrawerRole.value = null;
  }
});
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('system.role.createRole') }}
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
          <Button size="small" type="link" @click="onMenuAssign(row)">
            {{ $t('system.role.menuAssign') }}
          </Button>
        </div>
      </template>
    </Grid>

    <Modal
      v-model:open="menuDrawerVisible"
      :title="$t('system.role.menuAssign')"
      width="500px"
      @ok="handleMenuAssignSave"
    >
      <div class="mb-3 text-gray-500">
        {{
          $t('system.role.menuAssignHint', [
            menuDrawerRole?.roleName || menuDrawerRole?.roleCode || '',
          ])
        }}
      </div>
      <div v-if="menuLoading" class="flex h-40 items-center justify-center">
        {{ $t('system.role.menuLoading') }}
      </div>
      <Tree
        v-else
        v-model:checked-keys="checkedMenuKeys"
        :tree-data="menuTreeData"
        checkable
        default-expand-all
        :style="{ maxHeight: '400px', overflow: 'auto' }"
      />
    </Modal>
  </Page>
</template>
