<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { AiModel } from '#/api/ai/model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createAiModel, updateAiModel } from '#/api/ai/model';
import { $t } from '#/locales';

const emit = defineEmits<{ success: [] }>();

const formData = ref<AiModel>({} as AiModel);
const isEdit = computed(() => !!formData.value?.id);

const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'modelCode',
    label: $t('ai.model.modelCode'),
    rules: 'required',
    componentProps: { placeholder: 'deepseek-v4' },
  },
  {
    component: 'Input',
    fieldName: 'modelName',
    label: $t('ai.model.modelName'),
    rules: 'required',
    componentProps: { placeholder: 'DeepSeek V4' },
  },
  {
    component: 'Select',
    fieldName: 'provider',
    label: $t('ai.model.provider'),
    rules: 'required',
    componentProps: {
      options: [
        { label: 'DeepSeek', value: 'deepseek' },
        { label: 'OpenAI', value: 'openai' },
        { label: 'Anthropic', value: 'anthropic' },
        { label: 'Qwen', value: 'qwen' },
      ],
      placeholder: '选择供应商',
    },
  },
  {
    component: 'Input',
    fieldName: 'baseUrl',
    label: $t('ai.model.baseUrl'),
    rules: 'required',
    componentProps: { placeholder: 'https://api.deepseek.com/v1' },
  },
  {
    component: 'Input',
    fieldName: 'apiKey',
    help: $t('ai.model.apiKeyEditHint'),
    label: $t('ai.model.apiKey'),
    componentProps: {
      autocomplete: 'new-password',
      placeholder: 'sk-...',
      type: 'password',
    },
  },
  {
    component: 'Switch',
    fieldName: 'isEnabled',
    label: $t('ai.model.isEnabled'),
    defaultValue: 1,
    componentProps: { checkedValue: 1, unCheckedValue: 0 },
  },
  {
    component: 'InputNumber',
    fieldName: 'priority',
    label: $t('ai.model.priority'),
    componentProps: { min: 0, style: 'width: 100%' },
  },
  {
    component: 'Input',
    fieldName: 'description',
    label: $t('ai.model.description'),
    componentProps: { placeholder: '描述' },
  },
];

const [Form, formApi] = useVbenForm({
  schema,
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<AiModel>();
      if (data?.id) {
        formData.value = data;
        const { apiKey: _apiKey, ...safeData } = data;
        formApi.setValues({ ...safeData, apiKey: '' });
      } else {
        formData.value = {} as AiModel;
        formApi.resetForm();
      }
    }
  },
});

const title = computed(() =>
  isEdit.value ? $t('ai.model.editModel') : $t('ai.model.createModel'),
);

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  drawerApi.lock();
  try {
    const data = await formApi.getValues<AiModel>();
    if (isEdit.value) {
      if (!data.apiKey) {
        delete data.apiKey;
      }
      await updateAiModel({ ...data, id: formData.value.id });
    } else {
      await createAiModel(data);
    }
    drawerApi.close();
    emit('success');
  } finally {
    drawerApi.unlock();
  }
}
</script>

<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
