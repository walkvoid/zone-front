<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { PromptTemplate } from '#/api/ai/prompt-template';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deletePromptTemplate,
  getPromptTemplateList,
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
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: false },
    proxyConfig: {
      ajax: {
        query: async () => await getPromptTemplateList(),
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  } as VxeTableGridOptions,
});

function onActionClick({ code, row }: OnActionClickParams<PromptTemplate>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

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
  const templateId = row.id;
  if (templateId === undefined || templateId === null) return;
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.templateName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deletePromptTemplate(templateId)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.templateName]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => hideLoading());
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
    </Grid>
  </Page>
</template>
