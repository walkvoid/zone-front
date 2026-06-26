<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { PromptTemplate } from '#/api/ai/prompt-template';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenForm } from '#/adapter/form';
import {
  createPromptTemplate,
  updatePromptTemplate,
} from '#/api/ai/prompt-template';

const emit = defineEmits<{ success: [] }>();

const formData = ref<PromptTemplate>({} as PromptTemplate);

const isEdit = computed(() => !!formData.value?.id);
const title = computed(() =>
  isEdit.value
    ? $t('ai.promptTemplate.editTemplate')
    : $t('ai.promptTemplate.createTemplate'),
);

const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'templateCode',
    label: $t('ai.promptTemplate.templateCode'),
    rules: 'required',
    componentProps: { placeholder: 'STOCK_DAILY_QUERY' },
  },
  {
    component: 'Input',
    fieldName: 'templateName',
    label: $t('ai.promptTemplate.templateName'),
    rules: 'required',
    componentProps: { placeholder: '股票日线信息查询' },
  },
  {
    component: 'Select',
    fieldName: 'category',
    label: $t('ai.promptTemplate.category'),
    componentProps: {
      options: [
        { label: '金融', value: '金融' },
        { label: '股票', value: '股票' },
        { label: '通用', value: '通用' },
      ],
      placeholder: '选择分类',
    },
  },
  {
    component: 'Input',
    fieldName: 'variables',
    label: $t('ai.promptTemplate.variables'),
    componentProps: { placeholder: 'stock_code, start_date, end_date' },
  },
  {
    component: 'Input',
    fieldName: 'description',
    label: $t('ai.promptTemplate.description'),
    componentProps: { placeholder: '模板描述说明' },
  },
  {
    component: 'Input',
    fieldName: 'templateContent',
    label: $t('ai.promptTemplate.templateContent'),
    rules: 'required',
    componentProps: {
      type: 'textarea',
      rows: 20,
      style: {
        minHeight: '200px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },
      placeholder: '请输入模板内容...',
    },
    slot: 'templateContent',
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
      const data = drawerApi.getData<PromptTemplate>();
      if (data?.id) {
        formData.value = data;
        formApi.setValues(data);
      } else {
        formData.value = {} as PromptTemplate;
        formApi.resetForm();
      }
    }
  },
  title,
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  drawerApi.lock();
  try {
    const data = await formApi.getValues<PromptTemplate>();
    await (isEdit.value
      ? updatePromptTemplate({ ...data, id: formData.value.id })
      : createPromptTemplate(data));
    drawerApi.close();
    emit('success');
  } finally {
    drawerApi.unlock();
  }
}
</script>

<template>
  <Drawer>
    <Form>
      <template #templateContent="{ componentField }">
        <textarea
          :value="componentField.modelValue"
          rows="20"
          style="
            box-sizing: border-box;
            width: 100%;
            min-height: 200px;
            padding: 8px 12px;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.6;
            resize: vertical;
            outline: none;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
          "
          placeholder="请输入模板内容..."
          @input="componentField['onUpdate:modelValue']($event.target.value)"
        ></textarea>
      </template>
    </Form>
  </Drawer>
</template>
