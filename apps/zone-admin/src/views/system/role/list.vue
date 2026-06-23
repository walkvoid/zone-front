<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
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

import { useColumns } from './data';
import Form from './modules/form.vue';

// ====== 表单抽屉 ======
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

// ====== 表格 ======
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

// ====== 菜单分配抽屉 ======
const menuDrawerVisible = ref(false);
const menuDrawerRole = ref<null | SystemRoleApi.SystemRole>(null);
const menuTreeData = ref<any[]>([]);
const checkedMenuKeys = ref<number[]>([]);
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
  Modal.confirm({
    content: `确定要删除角色「${row.roleName || row.roleCode || ''}」吗？此操作不可恢复。`,
    title: '删除确认',
    onOk: async () => {
      const hideLoading = message.loading({
        content: '正在删除...',
        duration: 0,
        key: 'role_delete_msg',
      });
      try {
        await deleteRole(row.id!);
        message.success({
          content: '删除成功',
          key: 'role_delete_msg',
        });
        onRefresh();
      } catch {
        hideLoading();
      }
    },
  });
}

/** 将菜单树转换为 antdv-next Tree 所需的格式 */
function convertMenuToTreeData(
  menus: any[],
): { children: any[]; key: number; title: string }[] {
  return menus.map((menu) => {
    const node: any = {
      key: menu.id,
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
    const [menus, roleMenuIds] = await Promise.all([
      getMenuList(),
      getRoleMenus(row.id!),
    ]);
    menuTreeData.value = convertMenuToTreeData(menus);
    checkedMenuKeys.value = roleMenuIds || [];
  } catch {
    message.error('加载菜单数据失败');
  } finally {
    menuLoading.value = false;
  }
}

async function handleMenuAssignSave() {
  if (!menuDrawerRole.value) return;
  const hideLoading = message.loading({
    content: '正在保存菜单分配...',
    duration: 0,
    key: 'menu_assign_msg',
  });
  try {
    await assignRoleMenus(menuDrawerRole.value.id!, checkedMenuKeys.value);
    message.success({
      content: '菜单分配成功',
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
          新增角色
        </Button>
      </template>
      <template #action="{ row }">
        <div class="flex items-center justify-center gap-1">
          <Button size="small" type="link" @click="onEdit(row)">编辑</Button>
          <Button size="small" type="link" danger @click="onDelete(row)">
            删除
          </Button>
          <Button size="small" type="link" @click="onMenuAssign(row)">
            菜单分配
          </Button>
        </div>
      </template>
    </Grid>

    <!-- 菜单分配抽屉 -->
    <Modal
      v-model:open="menuDrawerVisible"
      title="菜单分配"
      width="500px"
      @ok="handleMenuAssignSave"
    >
      <div class="mb-3 text-gray-500">
        为角色「{{
          menuDrawerRole?.roleName || menuDrawerRole?.roleCode || ''
        }}」分配菜单权限：
      </div>
      <div v-if="menuLoading" class="flex h-40 items-center justify-center">
        加载中...
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
