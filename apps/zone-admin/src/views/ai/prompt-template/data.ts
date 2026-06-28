import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { PromptTemplate } from '#/api/ai/prompt-template';

import { $t } from '#/locales';

export function useColumns(
  onActionClick: OnActionClickFn<PromptTemplate>,
): VxeTableGridColumns<PromptTemplate> {
  return [
    {
      align: 'left',
      field: 'templateName',
      fixed: 'left',
      minWidth: 160,
      title: $t('ai.promptTemplate.templateName'),
    },
    {
      align: 'center',
      field: 'templateCode',
      minWidth: 150,
      title: $t('ai.promptTemplate.templateCode'),
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'processing',
            label: $t('ai.category.SYSTEM'),
            value: 'SYSTEM',
          },
          { color: 'default', label: $t('ai.category.USER'), value: 'USER' },
        ],
      },
      field: 'category',
      title: $t('ai.promptTemplate.category'),
      width: 80,
    },
    {
      field: 'variables',
      minWidth: 150,
      title: $t('ai.promptTemplate.variables'),
    },
    {
      field: 'description',
      minWidth: 150,
      title: $t('ai.promptTemplate.description'),
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
      field: 'status',
      title: $t('ai.promptTemplate.status'),
      width: 80,
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'templateName',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', 'delete'],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      title: $t('system.menu.operation'),
      width: 140,
    },
  ];
}
