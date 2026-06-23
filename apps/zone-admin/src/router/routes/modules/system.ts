import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ant-design:setting-outlined',
      order: 99,
      title: '系统管理',
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
          title: '菜单管理',
        },
      },
      {
        name: 'SystemRole',
        path: '/system/role',
        component: () => import('#/views/system/role/list.vue'),
        meta: {
          icon: 'ant-design:team-outlined',
          title: '角色管理',
        },
      },
      {
        name: 'SystemUser',
        path: '/system/user',
        component: () => import('#/views/system/user/list.vue'),
        meta: {
          icon: 'ant-design:user-outlined',
          title: '用户管理',
        },
      },
    ],
  },
];

export default routes;
