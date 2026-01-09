<template>
  <div>
    <n-page-header :title="t('request.createNew')" :subtitle="t('request.submitForApprovalHint')" @back="router.back()">
      <template #extra>
        <n-space>
          <n-button @click="router.back()">{{ t('common.cancel') }}</n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-card class="tw-mt-6">
      <n-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        label-placement="top"
        require-mark-placement="right-hanging"
      >
        <n-grid :cols="2" :x-gap="24">
          <!-- Title -->
          <n-form-item-grid-item :span="2" :label="t('request.title')" path="title">
            <n-input
              v-model:value="formState.title"
              :placeholder="t('request.titlePlaceholder')"
              :disabled="loading"
            />
          </n-form-item-grid-item>

          <!-- Description -->
          <n-form-item-grid-item :span="2" :label="t('request.description')" path="description">
            <n-input
              v-model:value="formState.description"
              type="textarea"
              :placeholder="t('request.descriptionPlaceholder')"
              :rows="4"
              :disabled="loading"
            />
          </n-form-item-grid-item>

          <!-- Category -->
          <n-form-item-grid-item :label="t('request.category')" path="category">
            <n-select
              v-model:value="formState.category"
              :options="categoryOptions"
              :placeholder="t('request.selectCategory')"
              :disabled="loading"
            />
          </n-form-item-grid-item>

          <!-- Amount -->
          <n-form-item-grid-item :label="t('request.amountYen')" path="amount">
            <n-input-number
              v-model:value="formState.amount"
              placeholder="0"
              :min="1"
              :step="1000"
              :disabled="loading"
              class="tw-w-full"
              :format="formatCurrency"
              :parse="parseCurrency"
            />
          </n-form-item-grid-item>

          <!-- Vendor Name (only for SOFTWARE) -->
          <n-form-item-grid-item
            v-if="formState.category === 'SOFTWARE'"
            :span="2"
            :label="t('request.vendorName')"
            path="vendor_name"
          >
            <n-input
              v-model:value="formState.vendor_name"
              :placeholder="t('request.vendorNamePlaceholder')"
              :disabled="loading"
            />
          </n-form-item-grid-item>

          <!-- Travel Dates (only for TRAVEL) -->
          <template v-if="formState.category === 'TRAVEL'">
            <n-form-item-grid-item :label="t('request.travelStartDate')" path="travel_start_date">
              <n-date-picker
                v-model:formatted-value="formState.travel_start_date"
                type="date"
                value-format="yyyy-MM-dd"
                :disabled="loading"
                class="tw-w-full"
              />
            </n-form-item-grid-item>

            <n-form-item-grid-item :label="t('request.travelEndDate')" path="travel_end_date">
              <n-date-picker
                v-model:formatted-value="formState.travel_end_date"
                type="date"
                value-format="yyyy-MM-dd"
                :disabled="loading"
                class="tw-w-full"
              />
            </n-form-item-grid-item>
          </template>

          <!-- Urgency -->
          <n-form-item-grid-item :label="t('request.urgency')" path="urgency">
            <n-select
              v-model:value="formState.urgency"
              :options="urgencyOptions"
              :disabled="loading"
            />
          </n-form-item-grid-item>

          <!-- Urgency Reason (only for URGENT) -->
          <n-form-item-grid-item
            v-if="formState.urgency === 'URGENT'"
            :span="2"
            :label="t('request.urgencyReason')"
            path="urgency_reason"
          >
            <n-input
              v-model:value="formState.urgency_reason"
              type="textarea"
              :placeholder="t('request.urgencyReasonPlaceholder')"
              :rows="3"
              :disabled="loading"
            />
          </n-form-item-grid-item>
        </n-grid>

        <!-- Approval Info Card -->
        <n-alert v-if="approvalStepsInfo" type="info" class="tw-mt-4">
          <template #header>{{ t('request.approvalProcess') }}</template>
          {{ approvalStepsInfo }}
        </n-alert>

        <!-- Action Buttons -->
        <n-space class="tw-mt-6" justify="end">
          <n-button :disabled="loading" @click="router.back()">
            {{ t('common.cancel') }}
          </n-button>
          <n-button
            type="default"
            :loading="loading && actionType === 'draft'"
            :disabled="loading"
            @click="handleSaveDraft"
          >
            {{ t('request.saveAsDraft') }}
          </n-button>
          <n-button
            type="primary"
            :loading="loading && actionType === 'submit'"
            :disabled="loading"
            @click="handleSubmit"
          >
            {{ t('request.submitForApproval') }}
          </n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInst, FormRules, FormItemRule } from 'naive-ui'
import { useMessage } from 'naive-ui'
import type { CreateRequestInput, RequestCategory, Urgency } from '~/types/request'
import { useI18n } from 'vue-i18n'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const router = useRouter()
const message = useMessage()
const { createRequest, submitRequest } = useRequests()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const actionType = ref<'draft' | 'submit'>('submit')

const formState = reactive<CreateRequestInput>({
  title: '',
  description: '',
  category: 'EQUIPMENT',
  amount: 0,
  vendor_name: '',
  urgency: 'NORMAL',
  urgency_reason: '',
  travel_start_date: '',
  travel_end_date: '',
})

const categoryOptions = computed(() => [
  { label: t('category.EQUIPMENT'), value: 'EQUIPMENT' },
  { label: t('category.SOFTWARE'), value: 'SOFTWARE' },
  { label: t('category.SERVICE'), value: 'SERVICE' },
  { label: t('category.TRAVEL'), value: 'TRAVEL' },
])

const urgencyOptions = computed(() => [
  { label: t('request.urgencyNormal'), value: 'NORMAL' },
  { label: t('request.urgencyUrgent'), value: 'URGENT' },
])

// Dynamic validation rules
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    title: [
      { required: true, message: 'Please enter request title', trigger: 'blur' },
      { min: 5, message: 'Title must be at least 5 characters', trigger: 'blur' },
    ],
    description: [
      { required: true, message: 'Please enter description', trigger: 'blur' },
      { min: 10, message: 'Description must be at least 10 characters', trigger: 'blur' },
    ],
    category: [
      { required: true, message: 'Please select a category', trigger: 'change' },
    ],
    amount: [
      { required: true, type: 'number', message: 'Please enter amount', trigger: 'blur' },
      {
        type: 'number',
        validator: (rule: FormItemRule, value: number) => {
          if (value <= 0) {
            return new Error('Amount must be greater than 0')
          }
          return true
        },
        trigger: 'blur',
      },
    ],
    urgency: [
      { required: true, message: 'Please select urgency', trigger: 'change' },
    ],
  }

  // Add vendor_name validation for SOFTWARE category
  if (formState.category === 'SOFTWARE') {
    rules.vendor_name = [
      { required: true, message: 'Vendor name is required for software purchases', trigger: 'blur' },
    ]
  }

  // Add travel dates validation for TRAVEL category
  if (formState.category === 'TRAVEL') {
    rules.travel_start_date = [
      { required: true, message: 'Please select travel start date', trigger: 'change' },
    ]
    rules.travel_end_date = [
      { required: true, message: 'Please select travel end date', trigger: 'change' },
      {
        validator: (rule: FormItemRule, value: string) => {
          if (formState.travel_start_date && value && value < formState.travel_start_date) {
            return new Error('End date must be after start date')
          }
          return true
        },
        trigger: 'change',
      },
    ]
  }

  // Add urgency reason validation for URGENT requests
  if (formState.urgency === 'URGENT') {
    rules.urgency_reason = [
      { required: true, message: 'Please provide a reason for urgent request', trigger: 'blur' },
      { min: 10, message: 'Reason must be at least 10 characters', trigger: 'blur' },
    ]
  }

  return rules
})

// Approval steps info based on amount
const approvalStepsInfo = computed(() => {
  if (!formState.amount || formState.amount <= 0) return null

  if (formState.amount <= 100000) {
    return t('request.approvalInfo1Level')
  } else if (formState.amount <= 500000) {
    return t('request.approvalInfo2Level')
  } else {
    return t('request.approvalInfo3Level')
  }
})

// Currency formatting
const formatCurrency = (value: number | null) => {
  if (!value) return ''
  return `¥ ${value.toLocaleString()}`
}

const parseCurrency = (input: string) => {
  const nums = input.replace(/[^0-9]/g, '')
  if (!nums) return null
  return parseInt(nums)
}

// Clean form data before sending
const getCleanFormData = (): CreateRequestInput => {
  const data: CreateRequestInput = {
    title: formState.title,
    description: formState.description,
    category: formState.category,
    amount: formState.amount,
    urgency: formState.urgency,
  }

  // Only include category-specific fields if relevant
  if (formState.category === 'SOFTWARE' && formState.vendor_name) {
    data.vendor_name = formState.vendor_name
  }

  if (formState.category === 'TRAVEL') {
    if (formState.travel_start_date) data.travel_start_date = formState.travel_start_date
    if (formState.travel_end_date) data.travel_end_date = formState.travel_end_date
  }

  if (formState.urgency === 'URGENT' && formState.urgency_reason) {
    data.urgency_reason = formState.urgency_reason
  }

  return data
}

// Save as draft
const handleSaveDraft = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true
    actionType.value = 'draft'

    const data = getCleanFormData()
    const request = await createRequest(data)

    message.success(t('request.savedAsDraft'))
    router.push(`/requests/${request.id}`)
  } catch (error: any) {
    if (error?.message && !error.message.includes('validation')) {
      message.error(error.message || t('request.failedToSaveDraft'))
    }
  } finally {
    loading.value = false
  }
}

// Submit for approval
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true
    actionType.value = 'submit'

    const data = getCleanFormData()

    // Create the request first
    const request = await createRequest(data)

    // Then submit it for approval
    await submitRequest(request.id)

    message.success(t('request.submittedForApproval'))
    router.push(`/requests/${request.id}`)
  } catch (error: any) {
    if (error?.message && !error.message.includes('validation')) {
      message.error(error.message || t('request.failedToSubmit'))
    }
  } finally {
    loading.value = false
  }
}
</script>
