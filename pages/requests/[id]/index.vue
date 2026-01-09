<template>
  <div>
    <n-page-header :title="`${t('request.requestId', { id: request?.id })}`" :subtitle="t('request.requestDetails')" @back="router.back()">
      <template #extra>
        <n-space>
          <n-button v-if="canEdit" @click="navigateTo(`/requests/${id}/edit`)">
            {{ t('common.edit') }}
          </n-button>
          <n-button v-if="canSubmit" type="primary" :loading="submitting" @click="handleSubmit">
            {{ t('request.submitForApproval') }}
          </n-button>
          <n-button v-if="canCancel" type="error" :loading="cancelling" @click="handleCancel">
            {{ t('request.cancelRequest') }}
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <!-- Loading State -->
    <n-spin v-if="pending" :size="60" class="tw-flex tw-justify-center tw-mt-20" />

    <!-- Error State -->
    <n-alert v-else-if="error" type="error" class="tw-mt-6">
      {{ t('error.failedToLoadRequest') }}: {{ error.message }}
    </n-alert>

    <!-- Request Details -->
    <div v-else-if="request" class="tw-space-y-6 tw-mt-6">
      <!-- Basic Information -->
      <n-card :title="t('request.basicInformation')">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item :label="t('request.status')">
            <n-tag :type="getStatusType(request.status)">
              {{ t(`status.${request.status}`) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item :label="t('request.category')">
            <n-tag>{{ t(`category.${request.category}`) }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item :label="t('request.title')" :span="2">
            {{ request.title }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('request.description')" :span="2">
            {{ request.description }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('request.amount')">
            ¥{{ request.amount.toLocaleString() }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('request.urgency')">
            <n-tag :type="request.urgency === 'URGENT' ? 'error' : 'default'">
              {{ request.urgency === 'URGENT' ? t('request.urgencyUrgent') : t('request.urgencyNormal') }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item v-if="request.vendor_name" :label="t('request.vendorName')" :span="2">
            {{ request.vendor_name }}
          </n-descriptions-item>
          <n-descriptions-item v-if="request.travel_start_date" :label="t('request.travelStartDate')">
            {{ formatDate(request.travel_start_date) }}
          </n-descriptions-item>
          <n-descriptions-item v-if="request.travel_end_date" :label="t('request.travelEndDate')">
            {{ formatDate(request.travel_end_date) }}
          </n-descriptions-item>
          <n-descriptions-item v-if="request.urgency_reason" :label="t('request.urgencyReason')" :span="2">
            {{ request.urgency_reason }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('request.createdAt')">
            {{ formatDateTime(request.created_at) }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('request.updatedAt')">
            {{ formatDateTime(request.updated_at) }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- Approval Timeline -->
      <n-card v-if="request.approval_steps && request.approval_steps.length > 0" :title="t('approval.approvalTimeline')">
        <n-steps :current="currentApprovalStep" status="process" vertical>
          <n-step
            v-for="step in request.approval_steps"
            :key="step.id"
            :title="`${t('approval.step')} ${step.step_number}: ${step.approver_role}`"
            :status="getStepStatus(step.status)"
          >
            <template #description>
              <div class="tw-space-y-2">
                <div v-if="step.approver">
                  <strong>{{ t('approval.approver') }}:</strong> {{ step.approver.name }}
                </div>
                <div>
                  <strong>{{ t('request.status') }}:</strong>
                  <n-tag :type="getApprovalStepType(step.status)" size="small" class="tw-ml-2">
                    {{ t(`approval.${step.status}`) }}
                  </n-tag>
                </div>
                <div v-if="step.comment">
                  <strong>{{ t('approval.comment') }}:</strong> {{ step.comment }}
                </div>
                <div v-if="step.approved_at">
                  <strong>{{ t('common.date') }}:</strong> {{ formatDateTime(step.approved_at) }}
                </div>
              </div>
            </template>
          </n-step>
        </n-steps>
      </n-card>

      <!-- Attachments -->
      <n-card :title="t('attachment.attachments')">
        <n-tabs type="line">
          <n-tab-pane name="list" :tab="t('attachment.attachedFiles')">
            <AttachmentList
              ref="attachmentListRef"
              :request-id="Number(id)"
              :can-delete="canEdit"
            />
          </n-tab-pane>

          <n-tab-pane v-if="canEdit" name="upload" :tab="t('attachment.uploadFiles')">
            <FileUpload
              :request-id="Number(id)"
              @success="handleUploadSuccess"
            />
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Request, RequestStatus, ApprovalStepStatus, ApprovalStep } from '~/types/request'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import FileUpload from '~/components/attachment/FileUpload.vue'
import AttachmentList from '~/components/attachment/AttachmentList.vue'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const message = useMessage()
const { getRequest, submitRequest, cancelRequest } = useRequests()
const { user } = useAuth()

const id = computed(() => route.params.id as string)

// Fetch request data
const { data: request, pending, error, refresh } = await getRequest(id.value)

const submitting = ref(false)
const cancelling = ref(false)
const attachmentListRef = ref<any>(null)

// Permission checks
const canEdit = computed(() => {
  if (!request.value || !user.value) return false
  return (request.value.status === 'DRAFT' || request.value.status === 'RETURNED') && request.value.user_id === user.value.id
})

const canSubmit = computed(() => {
  if (!request.value || !user.value) return false
  return (request.value.status === 'DRAFT' || request.value.status === 'RETURNED') && request.value.user_id === user.value.id
})

const canCancel = computed(() => {
  if (!request.value || !user.value) return false
  return (
    (request.value.status === 'SUBMITTED' || request.value.status === 'IN_REVIEW') &&
    request.value.user_id === user.value.id
  )
})

// Current approval step
const currentApprovalStep = computed(() => {
  if (!request.value?.approval_steps) return 0
  const pendingStep = request.value.approval_steps.find((step: ApprovalStep) => step.status === 'pending')
  return pendingStep ? pendingStep.step_number - 1 : request.value.approval_steps.length
})

// Status formatting
const getStatusType = (status: RequestStatus) => {
  const map: Record<RequestStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    DRAFT: 'default',
    SUBMITTED: 'info',
    IN_REVIEW: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    RETURNED: 'warning',
    CANCELLED: 'default',
    ARCHIVED: 'default',
  }
  return map[status] || 'default'
}

const getStepStatus = (status: ApprovalStepStatus) => {
  const map: Record<ApprovalStepStatus, 'process' | 'finish' | 'error' | 'wait'> = {
    pending: 'wait',
    approved: 'finish',
    rejected: 'error',
    returned: 'error',
  }
  return map[status] || 'wait'
}

const getApprovalStepType = (status: ApprovalStepStatus) => {
  const map: Record<ApprovalStepStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    pending: 'info',
    approved: 'success',
    rejected: 'error',
    returned: 'warning',
  }
  return map[status] || 'default'
}

// Date formatting
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString()
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// Actions
const handleSubmit = async () => {
  try {
    submitting.value = true
    await submitRequest(Number(id.value))
    message.success(t('request.submittedForApproval'))
    await refresh()
  } catch (err: any) {
    message.error(err.message || t('request.failedToSubmit'))
  } finally {
    submitting.value = false
  }
}

const handleCancel = async () => {
  try {
    cancelling.value = true
    await cancelRequest(Number(id.value))
    message.success(t('request.requestCancelled'))
    await refresh()
  } catch (err: any) {
    message.error(err.message || t('request.failedToCancel'))
  } finally {
    cancelling.value = false
  }
}

const handleUploadSuccess = () => {
  // Refresh attachment list after upload
  if (attachmentListRef.value && attachmentListRef.value.refresh) {
    attachmentListRef.value.refresh()
  }
}
</script>
