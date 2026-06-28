import { requestClient } from '#/api/request';

export interface AiModel {
  id?: string;
  modelCode: string;
  modelName: string;
  provider: string;
  baseUrl: string;
  apiKey?: string;
  callCount?: number;
  isEnabled?: number;
  priority?: number;
  description?: string;
  configJson?: string;
  createTime?: string;
  updateTime?: string;
}

export async function getAiModelList(params?: any) {
  return requestClient.get<AiModel[]>('/ai-model/page', { params });
}

export async function getAiModelById(id: string) {
  return requestClient.get<AiModel>(`/ai-model/${id}`);
}

export async function getEnabledModels() {
  return requestClient.get<AiModel[]>('/ai-model/enabled');
}

export async function createAiModel(data: AiModel) {
  return requestClient.post('/ai-model', data);
}

export async function updateAiModel(data: AiModel) {
  return requestClient.put('/ai-model', data);
}

export async function deleteAiModel(id: string) {
  return requestClient.delete(`/ai-model/${id}`);
}
