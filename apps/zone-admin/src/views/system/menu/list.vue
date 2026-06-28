<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';
import { $t, $te } from '@vben/locales';

import { MenuBadge } from '@vben-core/menu-ui';

import { Button, message, Modal } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMenu, getMenuList, SystemMenuApi } from '#/api/system/menu';

import { useColumns } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

function compareMenuOrder(
  a: SystemMenuApi.SystemMenu,
  b: SystemMenuApi.SystemMenu,
) {
  return (a.sort ?? a.meta?.order ?? 0) - (b.sort ?? b.meta?.order ?? 0);
}

function flattenMenuTree(
  menus: SystemMenuApi.SystemMenu[],
  bucket: SystemMenuApi.SystemMenu[] = [],
): SystemMenuApi.SystemMenu[] {
  [...menus].toSorted(compareMenuOrder).forEach((menu) => {
    const { children, ...current } = menu;
    bucket.push({
      ...current,
      id: String(current.id ?? ''),
      pid: String(current.pid ?? 0),
    });
    if (children?.length) {
      flattenMenuTree(children, bucket);
    }
  });
  return bucket;
}

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
          const tree = await getMenuList();
          return flattenMenuTree(tree);
        },
      },
    },
    treeConfig: {
      parentField: 'pid',
      rowField: 'id',
      transform: true,
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

function getMenuTitle(row: SystemMenuApi.SystemMenu) {
  const title = row.meta?.title || row.name || '';
  if (!title) {
    return '';
  }
  return $te(title) ? $t(title) : title;
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData(row).open();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onCreateChild(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData({ pid: String(row.id) }).open();
}

function onDelete(row: SystemMenuApi.SystemMenu) {
  Modal.confirm({
    content: `确定要删除菜单「${getMenuTitle(row) || row.name}」吗？`,
    onOk: async () => {
      await deleteMenu(String(row.id));
      message.success('删除成功');
      onRefresh();
    },
    title: '确认删除',
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
          {{ $t('ui.actionTitle.create', [$t('system.menu.name')]) }}
        </Button>
      </template>
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 shrink-0">
            <IconifyIcon
              v-if="row.type === 'button'"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.meta?.icon"
              :icon="row.meta?.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ getMenuTitle(row) }}</span>
          <div class="items-center justify-end"></div>
        </div>
        <MenuBadge
          v-if="row.meta?.badgeType"
          class="menu-badge"
          :badge="row.meta.badge"
          :badge-type="row.meta.badgeType"
          :badge-variants="row.meta.badgeVariants"
        />
      </template>
      <template #operation="{ row }">
        <div class="flex items-center justify-center gap-1">
          <Button size="small" type="link" @click="onCreateChild(row)">
            新增
          </Button>
          <Button size="small" type="link" @click="onEdit(row)"> 编辑 </Button>
          <Button size="small" type="link" danger @click="onDelete(row)">
            删除
          </Button>
        </div>
      </template>
    </Grid>
  </Page>
</template>
<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
