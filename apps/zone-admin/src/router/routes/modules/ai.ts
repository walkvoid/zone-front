import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ant-design:robot-outlined',
      order: 50,
      title: $t('ai.title'),
    },
    name: 'AIManage',
    path: '/ai',
    children: [
      {
        path: '/ai/prompt-template',
        name: 'AIPromptTemplate',
        meta: {
          icon: 'ant-design:file-text-outlined',
          title: $t('ai.promptTemplate.title'),
        },
        component: () => import('#/views/ai/prompt-template/list.vue'),
      },
      {
        path: '/ai/ai-model',
        name: 'AIModel',
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
