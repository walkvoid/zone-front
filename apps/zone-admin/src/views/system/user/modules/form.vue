<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { SystemUserApi } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';
import { createUser, updateUser } from '#/api/system/user';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemUserApi.SystemUser>();

const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'username',
    label: '用户名',
    rules: z.string().min(2, '用户名最少2个字符').max(30, '用户名最多30个字符'),
  },
  {
    component: 'Input',
    fieldName: 'nickname',
    label: '昵称',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: () => {
        return !formData.value?.id;
      },
    },
    fieldName: 'password',
    help: '新建用户时必填，编辑时留空则不修改密码',
    label: '密码',
    rules: z.string().min(6, '密码最少6个字符').optional(),
  },
  {
    component: 'Input',
    fieldName: 'phone',
    label: '手机号',
  },
  {
    component: 'Input',
    fieldName: 'email',
    label: '邮箱',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
    },
    fieldName: 'gender',
    label: '性别',
  },
  {
    component: 'Switch',
    componentProps: {
      checkedChildren: '启用',
      unCheckedChildren: '禁用',
    },
    defaultValue: true,
    fieldName: 'status',
    label: '状态',
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
      const data = drawerApi.getData<SystemUserApi.SystemUser>();
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
    const data = await formApi.getValues<SystemUserApi.SystemUser>();
    try {
      if (formData.value?.id) {
        // 编辑时如果没有填写密码，删除密码字段
        if (!data.password) {
          delete data.password;
        }
        await updateUser({ ...data, id: formData.value.id });
      } else {
        await createUser(data);
      }
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  }
}

const getDrawerTitle = computed(() =>
  formData.value?.id ? '编辑用户' : '新增用户',
);
</script>
<template>
  <Drawer class="w-full max-w-150" :title="getDrawerTitle">
    <Form class="mx-4" />
  </Drawer>
</template>
