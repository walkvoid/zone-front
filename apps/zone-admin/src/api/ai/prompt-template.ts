import type { VxePageResult } from '#/api/types/page';

import { requestClient } from '#/api/request';
import { fetchPage } from '#/api/types/page';

export interface PromptTemplate {
  id?: string;
  templateCode: string;
  templateName: string;
  templateContent: string;
  variables?: string;
  category?: string;
  description?: string;
  status?: number;
  createTime?: string;
  updateTime?: string;
}

export async function getPromptTemplatePage(params: {
  currentPage: number;
  pageSize: number;
  parameter?: Partial<PromptTemplate>;
}): Promise<VxePageResult<PromptTemplate>> {
  return fetchPage<PromptTemplate>(
    '/prompt-template/page',
    params.currentPage,
    params.pageSize,
    params.parameter,
  );
}

export async function getPromptTemplateById(id: string) {
  return requestClient.get<PromptTemplate>(`/prompt-template/${id}`);
}

export async function getPromptTemplateByCode(code: string) {
  return requestClient.get<PromptTemplate>(`/prompt-template/code/${code}`);
}

export async function createPromptTemplate(data: PromptTemplate) {
  return requestClient.post('/prompt-template', data);
}

export async function updatePromptTemplate(data: PromptTemplate) {
  return requestClient.put('/prompt-template', data);
}

export async function deletePromptTemplate(id: string) {
  return requestClient.delete(`/prompt-template/${id}`);
}
