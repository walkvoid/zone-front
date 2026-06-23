<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { SystemRoleApi } from '#/api/system/role';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';
import { createRole, updateRole } from '#/api/system/role';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemRoleApi.SystemRole>();

const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'roleCode',
    label: '角色编码',
    rules: z
      .string()
      .min(2, '角色编码最少2个字符')
      .max(50, '角色编码最多50个字符'),
  },
  {
    component: 'Input',
    fieldName: 'roleName',
    label: '角色名称',
    rules: z
      .string()
      .min(2, '角色名称最少2个字符')
      .max(50, '角色名称最多50个字符'),
  },
  {
    component: 'Input',
    componentProps: {
      type: 'textarea',
      rows: 3,
    },
    fieldName: 'description',
    label: '描述',
    rules: z.string().max(200, '描述最多200个字符').optional(),
  },
  {
    component: 'Switch',
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
    },
    defaultValue: false,
    fieldName: 'isSystem',
    label: '系统角色',
  },
];

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      if (data) {
        formData.value = data;
        formApi.setValues(formData.value);
      } else {
        formApi.resetForm();
      }
    }
  },
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (valid) {
    drawerApi.lock();
    const data = await formApi.getValues<SystemRoleApi.SystemRole>();
    try {
      if (formData.value?.id) {
        await updateRole({ ...data, id: formData.value.id });
      } else {
        await createRole(data);
      }
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  }
}

const getDrawerTitle = computed(() =>
  formData.value?.id ? '编辑角色' : '新增角色',
);
</script>
<template>
  <Drawer class="w-full max-w-150" :title="getDrawerTitle">
    <Form class="mx-4" />
  </Drawer>
</template>
