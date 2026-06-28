import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ant-design:setting-outlined',
      order: 99,
      title: $t('system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'SystemMenu',
        path: '/system/menu',
        component: () => import('#/views/system/menu/list.vue'),
        meta: {
          icon: 'ant-design:menu-outlined',
          title: $t('system.menu.title'),
        },
      },
      {
        name: 'SystemRole',
        path: '/system/role',
        component: () => import('#/views/system/role/list.vue'),
        meta: {
          icon: 'ant-design:team-outlined',
          title: $t('system.role.title'),
        },
      },
      {
        name: 'SystemUser',
        path: '/system/user',
        component: () => import('#/views/system/user/list.vue'),
        meta: {
          icon: 'ant-design:user-outlined',
          title: $t('system.user.title'),
        },
      },
      {
        name: 'SystemDept',
        path: '/system/dept',
        component: () => import('#/views/system/dept/list.vue'),
        meta: {
          icon: 'ant-design:apartment-outlined',
          title: $t('system.dept.title'),
        },
      },
    ],
  },
];

export default routes;
