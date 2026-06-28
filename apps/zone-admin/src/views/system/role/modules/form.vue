<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { SystemRoleApi } from '#/api/system/role';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';
import { createRole, updateRole } from '#/api/system/role';
import { $t } from '#/locales';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemRoleApi.SystemRole>();

const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'roleCode',
    label: $t('system.role.roleCode'),
    rules: z
      .string()
      .min(2, $t('system.role.roleCodeMin'))
      .max(50, $t('system.role.roleCodeMax')),
  },
  {
    component: 'Input',
    fieldName: 'roleName',
    label: $t('system.role.roleName'),
    rules: z
      .string()
      .min(2, $t('system.role.roleNameMin'))
      .max(50, $t('system.role.roleNameMax')),
  },
  {
    component: 'Input',
    componentProps: {
      type: 'textarea',
      rows: 3,
    },
    fieldName: 'description',
    label: $t('system.role.description'),
    rules: z.string().max(200, $t('system.role.descriptionMax')).optional(),
  },
  {
    component: 'Switch',
    componentProps: {
      checkedChildren: $t('system.role.yes'),
      unCheckedChildren: $t('system.role.no'),
    },
    defaultValue: false,
    fieldName: 'isSystem',
    label: $t('system.role.isSystem'),
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
    const data = await formApi.getValues<SystemRoleApi.SystemRole>();
    try {
      const roleId = formData.value?.id;
      await (roleId ? updateRole({ ...data, id: roleId }) : createRole(data));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  }
}

const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('system.role.editRole')
    : $t('system.role.createRole'),
);
</script>
<template>
  <Drawer class="w-full max-w-150" :title="getDrawerTitle">
    <Form class="mx-4" />
  </Drawer>
</template>
