<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { AiModel } from '#/api/ai/model';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteAiModel, getAiModelList } from '#/api/ai/model';
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
        query: async () => await getAiModelList(),
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  } as VxeTableGridOptions,
});

function onActionClick({ code, row }: OnActionClickParams<AiModel>) {
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
function onEdit(row: AiModel) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: AiModel) {
  const modelId = row.id;
  if (modelId === undefined || modelId === null) return;
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.modelName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteAiModel(modelId)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.modelName]),
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
          {{ $t('ai.model.createModel') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
