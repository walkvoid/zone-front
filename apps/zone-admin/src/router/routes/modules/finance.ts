import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ant-design:fund-outlined',
      order: 60,
      title: '金融管理',
    },
    name: 'FinanceManage',
    path: '/finance',
    redirect: '/finance/stock-indicator',
    children: [
      {
        name: 'StockIndicator',
        path: '/finance/stock-indicator',
        component: () => import('#/views/finance/stock-indicator/index.vue'),
        meta: {
          icon: 'ant-design:rise-outlined',
          title: '股票指标',
        },
      },
      {
        name: 'FundIndicator',
        path: '/finance/fund-indicator',
        component: () => import('#/views/finance/fund-indicator/index.vue'),
        meta: {
          icon: 'ant-design:account-book-outlined',
          title: '基金指标',
        },
      },
      {
        name: 'MacroIndicator',
        path: '/finance/macro-indicator',
        component: () => import('#/views/finance/macro-indicator/index.vue'),
        meta: {
          icon: 'ant-design:global-outlined',
          title: '宏观指标',
        },
      },
      // 股票详情页（不在菜单显示）
      {
        name: 'StockDetail',
        path: '/finance/stock/:stockCode',
        component: () => import('#/views/finance/stock/detail.vue'),
        meta: {
          hideInMenu: true,
          title: '股票详情',
        },
      },
    ],
  },
];

export default routes;
