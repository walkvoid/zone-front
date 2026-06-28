import { requestClient } from '#/api/request';

export interface WebPageBody<T = unknown> {
  code?: number;
  current?: number;
  data?: T[];
  message?: string;
  size?: number;
  total?: number;
}

export interface VxePageResult<T = unknown> {
  items: T[];
  total: number;
}

/**
 * vxe-table 页码从 1 开始；后端 PageRequest 默认 first=0，current 从 0 开始。
 */
export function buildPageParams<P extends Record<string, unknown>>(
  currentPage: number,
  pageSize: number,
  parameter?: P,
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    current: Math.max(0, currentPage - 1),
    size: pageSize,
  };
  if (parameter) {
    Object.entries(parameter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
  }
  return params;
}

export function toVxePageResult<T>(body: WebPageBody<T>): VxePageResult<T> {
  return {
    items: body.data ?? [],
    total: Number(body.total ?? 0),
  };
}

export async function fetchPage<
  T,
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  url: string,
  currentPage: number,
  pageSize: number,
  parameter?: P,
): Promise<VxePageResult<T>> {
  const body = await requestClient.get<WebPageBody<T>>(url, {
    params: buildPageParams(currentPage, pageSize, parameter),
    responseReturn: 'body',
  });
  return toVxePageResult(body);
}
