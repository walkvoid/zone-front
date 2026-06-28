import type { RouteRecordRaw } from 'vue-router';

import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordStringComponent,
} from '@vben-core/typings';

import { mapTree } from '@vben-core/shared/utils';

/**
 * 判断路由是否在菜单中显示但访问时展示 403（让用户知悉功能并申请权限）
 */
function menuHasVisibleWithForbidden(route: RouteRecordRaw): boolean {
  return !!route.meta?.menuVisibleWithForbidden;
}

/**
 * 动态生成路由 - 后端方式
 * 对 meta.menuVisibleWithForbidden 为 true 的项直接替换为 403 组件，让用户知悉功能并申请权限。
 */
async function generateRoutesByBackend(
  options: GenerateMenuAndRoutesOptions,
): Promise<RouteRecordRaw[]> {
  const {
    fetchMenuListAsync,
    layoutMap = {},
    pageMap = {},
    forbiddenComponent,
  } = options;

  try {
    const menuRoutes = await fetchMenuListAsync?.();
    if (!menuRoutes) {
      return [];
    }

    const normalizePageMap: ComponentRecordType = {};

    for (const [key, value] of Object.entries(pageMap)) {
      normalizePageMap[normalizeViewPath(key)] = value;
    }

    let routes = convertRoutes(menuRoutes, layoutMap, normalizePageMap);

    if (forbiddenComponent) {
      routes = mapTree(routes, (route) => {
        if (menuHasVisibleWithForbidden(route)) {
          route.component = forbiddenComponent;
        }
        return route;
      });
    }

    return routes;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function convertRoutes(
  routes: RouteRecordStringComponent[],
  layoutMap: ComponentRecordType,
  pageMap: ComponentRecordType,
): RouteRecordRaw[] {
  return mapTree(routes, (node) => {
    const route = node as unknown as RouteRecordRaw;
    const { component, name } = node;

    if (!name) {
      console.error('route name is required', route);
    }

    // layout转换
    if (component && layoutMap[component]) {
      route.component = layoutMap[component];
      // 页面组件转换
    } else if (component) {
      route.component = resolvePageComponent(component, pageMap);
    }

    return route;
  });
}

function resolvePageComponent(component: string, pageMap: ComponentRecordType) {
  const normalizePath = normalizeViewPath(component);
  const pageKey = normalizePath.endsWith('.vue')
    ? normalizePath
    : `${normalizePath}.vue`;

  const candidates = new Set<string>([pageKey]);

  if (pageKey.endsWith('/index.vue')) {
    candidates.add(pageKey.replace(/\/index\.vue$/, '/list.vue'));
  } else if (pageKey.endsWith('/list.vue')) {
    candidates.add(pageKey.replace(/\/list\.vue$/, '/index.vue'));
  }

  // 后端 url /ai/ai-model 对应前端 views/ai/model/list.vue
  if (pageKey.includes('/ai/ai-model/')) {
    candidates.add(pageKey.replace('/ai/ai-model/', '/ai/model/'));
    candidates.add(
      pageKey
        .replace('/ai/ai-model/', '/ai/model/')
        .replace('/index.vue', '/list.vue'),
    );
  }

  for (const key of candidates) {
    if (pageMap[key]) {
      return pageMap[key];
    }
  }

  console.error(`route component is invalid: ${pageKey}`, [...candidates]);
  return pageMap['/_core/fallback/not-found.vue'];
}

function normalizeViewPath(path: string): string {
  // 去除相对路径前缀
  const normalizedPath = path.replace(/^(\.\/|\.\.\/)+/, '');

  // 确保路径以 '/' 开头
  const viewPath = normalizedPath.startsWith('/')
    ? normalizedPath
    : `/${normalizedPath}`;

  // 这里耦合了vben-admin的目录结构
  return viewPath.replace(/^\/views/, '');
}
export { generateRoutesByBackend };
