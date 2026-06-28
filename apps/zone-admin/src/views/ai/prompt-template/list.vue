<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { PromptTemplate } from '#/api/ai/prompt-template';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deletePromptTemplate,
  getPromptTemplatePage,
} from '#/api/ai/prompt-template';
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
          await getPromptTemplatePage({
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

function onEdit(row: PromptTemplate) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: PromptTemplate) {
  const templateName = row.templateName || row.templateCode || '';
  Modal.confirm({
    content: $t('ui.actionMessage.deleteConfirm', [templateName]),
    title: $t('ui.actionTitle.delete', [$t('ai.promptTemplate.title')]),
    onOk: async () => {
      const templateId = row.id;
      if (templateId === undefined || templateId === null) return;
      const hideLoading = message.loading({
        content: $t('ui.actionMessage.deleting', [templateName]),
        duration: 0,
        key: 'prompt_template_delete_msg',
      });
      try {
        await deletePromptTemplate(String(templateId));
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [templateName]),
          key: 'prompt_template_delete_msg',
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
          {{ $t('ai.promptTemplate.createTemplate') }}
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
