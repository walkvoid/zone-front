<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { SystemUserApi } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';
import { createUser, updateUser } from '#/api/system/user';
import { $t } from '#/locales';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemUserApi.SystemUser>();

const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'username',
    label: $t('system.user.name'),
    rules: z
      .string()
      .min(2, $t('system.user.usernameMin'))
      .max(30, $t('system.user.usernameMax')),
  },
  {
    component: 'Input',
    fieldName: 'nickname',
    label: $t('system.user.nickname'),
  },
  {
    component: 'InputPassword',
    dependencies: {
      show(values) {
        return !values.id;
      },
      triggerFields: ['id'],
    },
    fieldName: 'password',
    help: $t('system.user.passwordHelp'),
    label: $t('system.user.password'),
    rules: z.string().min(6, $t('system.user.passwordMin')).optional(),
  },
  {
    component: 'Input',
    fieldName: 'phone',
    label: $t('system.user.phone'),
  },
  {
    component: 'Input',
    fieldName: 'email',
    label: $t('system.user.email'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: $t('system.user.genderMale'), value: 'male' },
        { label: $t('system.user.genderFemale'), value: 'female' },
      ],
    },
    fieldName: 'gender',
    label: $t('system.user.gender'),
  },
  {
    component: 'Switch',
    componentProps: {
      checkedChildren: $t('common.enabled'),
      unCheckedChildren: $t('common.disabled'),
    },
    defaultValue: true,
    fieldName: 'status',
    label: $t('system.user.status'),
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
        formData.value = undefined;
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
  formData.value?.id
    ? $t('system.user.editUser')
    : $t('system.user.createUser'),
);
</script>
<template>
  <Drawer class="w-full max-w-150" :title="getDrawerTitle">
    <Form class="mx-4" />
  </Drawer>
</template>
