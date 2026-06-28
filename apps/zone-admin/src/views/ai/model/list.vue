<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AiModel } from '#/api/ai/model';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteAiModel, getAiModelPage } from '#/api/ai/model';
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
    pagerConfig: { enabled: true },
    proxyConfig: {
      ajax: {
        query: async ({ page }) =>
          await getAiModelPage({
            currentPage: page.currentPage,
            pageSize: page.pageSize,
          }),
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  } as VxeTableGridOptions,
});

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onEdit(row: AiModel) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: AiModel) {
  const modelName = row.modelName || row.modelCode || '';
  Modal.confirm({
    content: $t('ui.actionMessage.deleteConfirm', [modelName]),
    title: $t('ui.actionTitle.delete', [$t('ai.model.title')]),
    onOk: async () => {
      const modelId = row.id;
      if (modelId === undefined || modelId === null) return;
      const hideLoading = message.loading({
        content: $t('ui.actionMessage.deleting', [modelName]),
        duration: 0,
        key: 'ai_model_delete_msg',
      });
      try {
        await deleteAiModel(String(modelId));
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [modelName]),
          key: 'ai_model_delete_msg',
        });
        onRefresh();
      } catch {
        hideLoading();
      }
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
          {{ $t('ai.model.createModel') }}
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
        </div>
      </template>
    </Grid>
  </Page>
</template>
