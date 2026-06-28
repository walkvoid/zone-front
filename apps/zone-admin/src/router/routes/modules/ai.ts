import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ant-design:robot-outlined',
      order: 9998,
      title: $t('ai.title'),
    },
    name: 'Ai',
    path: '/ai',
    children: [
      {
        path: '/ai/prompt-template',
        name: 'AiPromptTemplate',
        meta: {
          icon: 'ant-design:file-text-outlined',
          title: $t('ai.promptTemplate.title'),
        },
        component: () => import('#/views/ai/prompt-template/list.vue'),
      },
      {
        path: '/ai/ai-model',
        name: 'AiModel',
        meta: {
          icon: 'ant-design:robot-outlined',
          title: $t('ai.model.title'),
        },
        component: () => import('#/views/ai/model/list.vue'),
      },
    ],
  },
];

export default routes;
