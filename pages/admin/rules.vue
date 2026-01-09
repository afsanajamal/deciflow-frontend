<template>
  <div>
    <n-page-header :title="t('nav.approvalRules')" :subtitle="t('admin.manageApprovalRules')">
      <template #extra>
        <n-button type="primary" @click="openCreateModal">
          {{ t('admin.createNewRule') }}
        </n-button>
      </template>
    </n-page-header>

    <n-card class="tw-mt-6">
      <!-- Loading State -->
      <n-spin v-if="pending" :size="60" class="tw-flex tw-justify-center tw-py-20" />

      <!-- Error State -->
      <n-alert v-else-if="error" type="error">
        {{ t('error.loadFailed', { resource: t('admin.approvalRules') }) }}: {{ error.message }}
      </n-alert>

      <!-- Rules Table -->
      <div v-else>
        <n-data-table
          :columns="columns"
          :data="rules || []"
        />

        <!-- Empty State -->
        <n-empty
          v-if="!rules || rules.length === 0"
          :description="t('admin.noRulesConfigured')"
          class="tw-py-8"
        >
          <template #extra>
            <n-button type="primary" @click="openCreateModal">
              {{ t('admin.createFirstRule') }}
            </n-button>
          </template>
        </n-empty>
      </div>
    </n-card>

    <!-- Create/Edit Rule Modal -->
    <n-modal
      v-model:show="showModal"
      preset="dialog"
      :title="modalMode === 'create' ? t('admin.createNewRule') : t('admin.editRule')"
      :positive-text="modalMode === 'create' ? t('common.create') : t('common.update')"
      :negative-text="t('common.cancel')"
      :loading="submitting"
      @positive-click="handleSubmit"
      @negative-click="handleCancel"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="top"
      >
        <n-form-item :label="t('admin.ruleName')" path="name">
          <n-input
            v-model:value="formData.name"
            :placeholder="t('admin.ruleNamePlaceholder')"
          />
        </n-form-item>

        <n-form-item :label="t('request.category')" path="category">
          <n-select
            v-model:value="formData.category"
            :options="categoryOptions"
            :placeholder="t('admin.selectCategoryOptional')"
            clearable
          />
        </n-form-item>

        <n-form-item :label="t('admin.amountMin')" path="min_amount">
          <n-input-number
            v-model:value="formData.min_amount"
            placeholder="0"
            :min="0"
            :step="1000"
            class="tw-w-full"
            :format="formatCurrency"
            :parse="parseCurrency"
          />
        </n-form-item>

        <n-form-item :label="t('admin.amountMax')" path="max_amount">
          <n-input-number
            v-model:value="formData.max_amount"
            :placeholder="t('admin.noLimit')"
            :min="0"
            :step="1000"
            class="tw-w-full"
            :format="formatCurrency"
            :parse="parseCurrency"
            clearable
          />
        </n-form-item>

        <n-form-item :label="t('admin.approvalSteps')" path="approval_steps_json">
          <div class="tw-w-full tw-space-y-2">
            <div
              v-for="(step, index) in formData.approval_steps_json"
              :key="index"
              class="tw-flex tw-gap-2 tw-items-center"
            >
              <n-input-number
                :value="step.step"
                @update:value="(val: number | null) => updateStepNumber(index, val)"
                :placeholder="t('admin.step')"
                :min="1"
                :max="10"
                class="tw-w-24"
              />
              <n-select
                :value="step.role"
                @update:value="(val: string) => updateStepRole(index, val)"
                :options="roleOptions"
                :placeholder="t('admin.selectRole')"
                class="tw-flex-1"
              />
              <n-button
                type="error"
                size="small"
                @click="removeStep(index)"
                :disabled="formData.approval_steps_json.length === 1"
              >
                {{ t('admin.removeStep') }}
              </n-button>
            </div>
            <n-button type="primary" size="small" @click="addStep">
              {{ t('admin.addStep') }}
            </n-button>
          </div>
        </n-form-item>

        <n-form-item :label="t('admin.active')" path="is_active">
          <n-switch v-model:value="formData.is_active" />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import type { Rule } from '~/types/rule'
import { NButton, NPopconfirm, useMessage } from 'naive-ui'
import { h } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['dept_admin', 'super_admin'],
})

const { t } = useI18n()
const message = useMessage()
const { listRules, createRule, updateRule, deleteRule } = useRules()

const { data: rules, pending, error, refresh } = await listRules()

const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInst | null>(null)
const submitting = ref(false)

const formData = reactive({
  id: null as number | null,
  name: '',
  min_amount: 0,
  max_amount: null as number | null,
  approval_steps_json: [{ step: 1, role: '' }],
  category: null as string | null,
  is_active: true,
})

const roleOptions = computed(() => [
  { label: t('admin.roleApprover'), value: 'approver' },
  { label: t('admin.roleDeptAdmin'), value: 'dept_admin' },
  { label: t('admin.roleSuperAdmin'), value: 'super_admin' },
])

const categoryOptions = computed(() => [
  { label: t('category.GENERAL'), value: 'GENERAL' },
  { label: t('category.SOFTWARE'), value: 'SOFTWARE' },
  { label: t('category.HARDWARE'), value: 'HARDWARE' },
  { label: t('category.TRAVEL'), value: 'TRAVEL' },
  { label: t('category.OTHER'), value: 'OTHER' },
])

const formRules = computed<FormRules>(() => ({
  name: [
    { required: true, message: t('validation.required', { field: t('admin.ruleName') }), trigger: 'blur' },
  ],
  min_amount: [
    { required: true, type: 'number', message: t('validation.required', { field: t('admin.amountMin') }), trigger: 'blur' },
  ],
  approval_steps_json: [
    { required: true, type: 'array', message: t('admin.atLeastOneStepRequired'), trigger: 'blur' },
  ],
}))

// Currency formatting
const formatCurrency = (value: number | null) => {
  if (!value && value !== 0) return ''
  return `¥ ${value.toLocaleString()}`
}

const parseCurrency = (input: string) => {
  const nums = input.replace(/[^0-9]/g, '')
  if (!nums) return null
  return parseInt(nums)
}

const columns = computed<DataTableColumns<Rule>>(() => [
  {
    title: t('admin.id'),
    key: 'id',
    width: 80,
  },
  {
    title: t('admin.ruleName'),
    key: 'name',
    width: 200,
  },
  {
    title: t('request.category'),
    key: 'category',
    width: 120,
    render(row) {
      return row.category ? t(`category.${row.category}`) : t('admin.allCategories')
    },
  },
  {
    title: t('admin.amountRange'),
    key: 'amount',
    render(row) {
      const min = `¥${row.min_amount.toLocaleString()}`
      const max = row.max_amount ? `¥${row.max_amount.toLocaleString()}` : t('admin.noLimit')
      return `${min} - ${max}`
    },
  },
  {
    title: t('admin.approvalSteps'),
    key: 'approval_steps',
    render(row) {
      try {
        const steps = typeof row.approval_steps_json === 'string'
          ? JSON.parse(row.approval_steps_json)
          : row.approval_steps_json

        if (!Array.isArray(steps)) return 'N/A'

        return steps.map((s: any) => {
          const stepNum = s.step ?? s.step_number ?? '?'
          const role = s.role ?? s.approver_role ?? '?'
          return `${t('admin.step')} ${stepNum}: ${role}`
        }).join(', ')
      } catch (e) {
        console.error('Failed to parse approval steps:', e, row.approval_steps_json)
        return t('admin.invalidJSON')
      }
    },
  },
  {
    title: t('request.status'),
    key: 'is_active',
    width: 100,
    render(row) {
      return row.is_active ? t('admin.active') : t('admin.inactive')
    },
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 180,
    render(row) {
      return h('div', { class: 'tw-space-x-2' }, [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => openEditModal(row),
          },
          { default: () => t('common.edit') }
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id),
          },
          {
            trigger: () => h(
              NButton,
              {
                size: 'small',
                type: 'error',
              },
              { default: () => t('common.delete') }
            ),
            default: () => t('admin.confirmDeleteRule'),
          }
        ),
      ])
    },
  },
])

const updateStepNumber = (index: number, value: number | null): void => {
  if (value !== null) {
    const newSteps = [...formData.approval_steps_json]
    newSteps[index] = { ...newSteps[index], step: value }
    formData.approval_steps_json = newSteps
  }
}

const updateStepRole = (index: number, value: string): void => {
  const newSteps = [...formData.approval_steps_json]
  newSteps[index] = { ...newSteps[index], role: value }
  formData.approval_steps_json = newSteps
}

const addStep = () => {
  const nextStep = formData.approval_steps_json.length + 1
  formData.approval_steps_json = [
    ...formData.approval_steps_json,
    { step: nextStep, role: '' }
  ]
}

const removeStep = (index: number) => {
  formData.approval_steps_json = formData.approval_steps_json.filter((_, i) => i !== index)
}

const openCreateModal = () => {
  modalMode.value = 'create'
  formData.id = null
  formData.name = ''
  formData.min_amount = 0
  formData.max_amount = null
  formData.approval_steps_json = [{ step: 1, role: '' }]
  formData.category = null
  formData.is_active = true
  showModal.value = true
}

const openEditModal = (rule: Rule) => {
  modalMode.value = 'edit'
  formData.id = rule.id
  formData.name = rule.name
  formData.min_amount = rule.min_amount
  formData.max_amount = rule.max_amount

  // Parse approval_steps_json if it's a string
  let steps = typeof rule.approval_steps_json === 'string'
    ? JSON.parse(rule.approval_steps_json)
    : rule.approval_steps_json

  // Ensure steps is an array and has proper structure
  if (!Array.isArray(steps)) {
    steps = [{ step: 1, role: '' }]
  }

  // Create a fresh copy of the steps array
  formData.approval_steps_json = steps.map((s: any) => ({
    step: s.step ?? 1,
    role: s.role ?? ''
  }))

  formData.category = rule.category
  formData.is_active = rule.is_active
  showModal.value = true
}

const handleCancel = () => {
  showModal.value = false
  return false
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    submitting.value = true

    const data = {
      name: formData.name,
      min_amount: formData.min_amount,
      max_amount: formData.max_amount,
      approval_steps_json: formData.approval_steps_json,
      category: formData.category,
      is_active: formData.is_active,
    }

    if (modalMode.value === 'create') {
      await createRule(data)
      message.success(t('admin.ruleCreated'))
    } else {
      await updateRule(formData.id!, data)
      message.success(t('admin.ruleUpdated'))
    }

    showModal.value = false
    await refresh()
    return true
  } catch (err: any) {
    if (err?.message && !err.message.includes('validation')) {
      message.error(err.message || t('admin.failedToSaveRule'))
    }
    return false
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteRule(id)
    message.success(t('admin.ruleDeleted'))
    await refresh()
  } catch (err: any) {
    message.error(err.message || t('admin.failedToDeleteRule'))
  }
}
</script>
