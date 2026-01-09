<template>
  <div>
    <n-page-header :title="t('request.editRequest') + ` #${id}`" :subtitle="t('request.updateRequest')" @back="router.back()">
      <template #extra>
        <n-space>
          <n-button @click="router.back()">{{ t('common.cancel') }}</n-button>
        </n-space>
      </template>
    </n-page-header>

    <!-- Loading State -->
    <n-spin v-if="pending" :size="60" class="tw-flex tw-justify-center tw-mt-20" />

    <!-- Error State -->
    <n-alert v-else-if="error" type="error" class="tw-mt-6">
      {{ t('error.failedToLoadRequest') }}: {{ error.message }}
    </n-alert>

    <!-- Not Editable -->
    <n-alert v-else-if="request && request.status !== 'DRAFT' && request.status !== 'RETURNED'" type="warning" class="tw-mt-6">
      <template #header>{{ t('request.cannotEdit') }}</template>
      {{ t('request.onlyDraftEditable') }}
      <template #footer>
        <n-button type="primary" @click="router.push(`/requests/${id}`)">
          {{ t('request.viewDetails') }}
        </n-button>
      </template>
    </n-alert>

    <!-- Edit Form -->
    <n-card v-else-if="request" class="tw-mt-6">
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

        <!-- Attachments -->
        <n-divider />
        <n-h3>{{ t('attachment.attachments') }}</n-h3>
        <n-tabs type="line" class="tw-mt-4">
          <n-tab-pane name="list" :tab="t('attachment.attachedFiles')">
            <AttachmentList
              ref="attachmentListRef"
              :request-id="Number(id)"
              :can-delete="true"
            />
          </n-tab-pane>

          <n-tab-pane name="upload" :tab="t('attachment.uploadFiles')">
            <FileUpload
              :request-id="Number(id)"
              @success="handleUploadSuccess"
            />
          </n-tab-pane>
        </n-tabs>

        <!-- Approval Info Card -->
        <n-alert v-if="approvalStepsInfo" type="info" class="tw-mt-4">
          <template #header>{{ t('request.approvalProcess') }}</template>
          {{ approvalStepsInfo }}
        </n-alert>

        <!-- Action Buttons -->
        <n-space class="tw-mt-6" justify="end">
          <n-button @click="router.back()" :disabled="loading">
            {{ t('common.cancel') }}
          </n-button>
          <n-button
            type="default"
            :loading="loading && actionType === 'save'"
            :disabled="loading"
            @click="handleSave"
          >
            {{ t('request.saveChanges') }}
          </n-button>
          <n-button
            type="primary"
            :loading="loading && actionType === 'submit'"
            :disabled="loading"
            @click="handleSaveAndSubmit"
          >
            {{ t('request.saveAndSubmit') }}
          </n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInst, FormRules, FormItemRule } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import type { CreateRequestInput, RequestCategory, Urgency } from '~/types/request'
import FileUpload from '~/components/attachment/FileUpload.vue'
import AttachmentList from '~/components/attachment/AttachmentList.vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const { getRequest, updateRequest, submitRequest } = useRequests()

const id = computed(() => route.params.id as string)

// Fetch existing request
const { data: request, pending, error } = await getRequest(id.value)

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const actionType = ref<'save' | 'submit'>('save')
const attachmentListRef = ref<any>(null)

// Initialize form state with existing request data
const formState = reactive<CreateRequestInput>({
  title: request.value?.title || '',
  description: request.value?.description || '',
  category: (request.value?.category || 'EQUIPMENT') as RequestCategory,
  amount: request.value?.amount || 0,
  vendor_name: request.value?.vendor_name || '',
  urgency: (request.value?.urgency || 'NORMAL') as Urgency,
  urgency_reason: request.value?.urgency_reason || '',
  travel_start_date: request.value?.travel_start_date || '',
  travel_end_date: request.value?.travel_end_date || '',
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
      { required: true, message: t('validation.required', { field: t('request.title') }), trigger: 'blur' },
      { min: 5, message: t('validation.min', { field: t('request.title'), min: '5 characters' }), trigger: 'blur' },
    ],
    description: [
      { required: true, message: t('validation.required', { field: t('request.description') }), trigger: 'blur' },
      { min: 10, message: t('validation.min', { field: t('request.description'), min: '10 characters' }), trigger: 'blur' },
    ],
    category: [
      { required: true, message: t('validation.required', { field: t('request.category') }), trigger: 'change' },
    ],
    amount: [
      { required: true, type: 'number', message: t('validation.required', { field: t('request.amount') }), trigger: 'blur' },
      {
        type: 'number',
        validator: (rule: FormItemRule, value: number) => {
          if (value <= 0) {
            return new Error(t('request.amountMustBePositive'))
          }
          return true
        },
        trigger: 'blur',
      },
    ],
    urgency: [
      { required: true, message: t('validation.required', { field: t('request.urgency') }), trigger: 'change' },
    ],
  }

  // Add vendor_name validation for SOFTWARE category
  if (formState.category === 'SOFTWARE') {
    rules.vendor_name = [
      { required: true, message: t('request.vendorNameRequired'), trigger: 'blur' },
    ]
  }

  // Add travel dates validation for TRAVEL category
  if (formState.category === 'TRAVEL') {
    rules.travel_start_date = [
      { required: true, message: t('validation.required', { field: t('request.travelStartDate') }), trigger: 'change' },
    ]
    rules.travel_end_date = [
      { required: true, message: t('validation.required', { field: t('request.travelEndDate') }), trigger: 'change' },
      {
        validator: (rule: FormItemRule, value: string) => {
          if (formState.travel_start_date && value && value < formState.travel_start_date) {
            return new Error(t('request.endDateAfterStartDate'))
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
      { required: true, message: t('validation.required', { field: t('request.urgencyReason') }), trigger: 'blur' },
      { min: 10, message: t('validation.min', { field: t('request.urgencyReason'), min: '10 characters' }), trigger: 'blur' },
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
const getCleanFormData = (): Partial<CreateRequestInput> => {
  const data: Partial<CreateRequestInput> = {
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

// Save changes without submitting
const handleSave = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true
    actionType.value = 'save'

    const data = getCleanFormData()
    await updateRequest(Number(id.value), data)

    message.success(t('request.updated'))
    router.push(`/requests/${id.value}`)
  } catch (error: any) {
    if (error?.message && !error.message.includes('validation')) {
      message.error(error.message || t('request.failedToUpdate'))
    }
  } finally {
    loading.value = false
  }
}

// Save and submit for approval
const handleSaveAndSubmit = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true
    actionType.value = 'submit'

    const data = getCleanFormData()

    // Update the request first
    await updateRequest(Number(id.value), data)

    // Then submit it for approval
    await submitRequest(Number(id.value))

    message.success(t('request.updatedAndSubmitted'))
    router.push(`/requests/${id.value}`)
  } catch (error: any) {
    if (error?.message && !error.message.includes('validation')) {
      message.error(error.message || t('request.failedToSubmit'))
    }
  } finally {
    loading.value = false
  }
}

const handleUploadSuccess = () => {
  // Refresh attachment list after upload
  if (attachmentListRef.value && attachmentListRef.value.refresh) {
    attachmentListRef.value.refresh()
  }
}
</script>
