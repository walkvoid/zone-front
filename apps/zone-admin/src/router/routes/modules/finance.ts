import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ant-design:fund-outlined',
      order: 60,
      title: $t('finance.title'),
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
          title: $t('finance.stockIndicator.title'),
        },
      },
      {
        name: 'FundIndicator',
        path: '/finance/fund-indicator',
        component: () => import('#/views/finance/fund-indicator/index.vue'),
        meta: {
          icon: 'ant-design:account-book-outlined',
          title: $t('finance.fundIndicator.title'),
        },
      },
      {
        name: 'MacroIndicator',
        path: '/finance/macro-indicator',
        component: () => import('#/views/finance/macro-indicator/index.vue'),
        meta: {
          icon: 'ant-design:global-outlined',
          title: $t('finance.macroIndicator.title'),
        },
      },
      {
        name: 'StockDetail',
        path: '/finance/stock/:stockCode',
        component: () => import('#/views/finance/stock/detail.vue'),
        meta: {
          hideInMenu: true,
          title: $t('finance.stockDetail.title'),
        },
      },
    ],
  },
];

export default routes;
