import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { AiModel } from '#/api/ai/model';

import { $t } from '#/locales';

export function useColumns(): VxeTableGridColumns<AiModel> {
  return [
    {
      align: 'left',
      field: 'modelName',
      fixed: 'left',
      minWidth: 150,
      title: $t('ai.model.modelName'),
    },
    {
      align: 'center',
      field: 'modelCode',
      minWidth: 140,
      title: $t('ai.model.modelCode'),
    },
    {
      align: 'center',
      field: 'provider',
      title: $t('ai.model.provider'),
      width: 100,
    },
    {
      field: 'baseUrl',
      minWidth: 200,
      title: $t('ai.model.baseUrl'),
    },
    {
      align: 'center',
      field: 'callCount',
      title: $t('ai.model.callCount'),
      width: 100,
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: $t('common.enabled'), value: 1 },
          { color: 'error', label: $t('common.disabled'), value: 0 },
        ],
      },
      field: 'isEnabled',
      title: $t('ai.model.isEnabled'),
      width: 80,
    },
    {
      align: 'center',
      field: 'priority',
      title: $t('ai.model.priority'),
      width: 80,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('system.menu.operation'),
      width: 140,
    },
  ];
}
