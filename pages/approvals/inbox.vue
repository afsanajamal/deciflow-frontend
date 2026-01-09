<template>
  <div>
    <n-page-header :title="t('nav.approvalInbox')" :subtitle="t('approval.reviewAndApprove')" />

    <n-card class="tw-mt-6">
      <!-- Loading State -->
      <n-spin v-if="loading" :size="60" class="tw-flex tw-justify-center tw-py-20" />

      <!-- Error State -->
      <n-alert v-else-if="error" type="error">
        {{ t('error.failedToLoadApprovals') }}: {{ error.message }}
      </n-alert>

      <!-- Approvals Table -->
      <div v-else>
        <n-data-table
          :columns="columns"
          :data="approvals || []"
          :pagination="pagination"
        />

        <!-- Empty State -->
        <n-empty
          v-if="!approvals || approvals.length === 0"
          :description="t('approval.noPendingApprovals')"
          class="tw-py-8"
        />
      </div>
    </n-card>

    <!-- Approval Action Modal -->
    <n-modal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      :positive-text="modalAction === 'approve' ? t('approval.approve') : modalAction === 'reject' ? t('approval.reject') : t('approval.return')"
      :negative-text="t('common.cancel')"
      :loading="submitting"
      @positive-click="handleModalSubmit"
      @negative-click="handleModalCancel"
    >
      <div class="tw-space-y-4">
        <!-- Request Summary -->
        <n-descriptions v-if="selectedRequest" :column="1" bordered size="small">
          <n-descriptions-item :label="t('request.id')">
            #{{ selectedRequest.id }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('request.title')">
            {{ selectedRequest.title }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('approval.requester')">
            {{ selectedRequest.user?.name || t('common.unknown') }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('request.amount')">
            ¥{{ selectedRequest.amount.toLocaleString() }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('request.category')">
            {{ t(`category.${selectedRequest.category}`) }}
          </n-descriptions-item>
        </n-descriptions>

        <!-- Comment Field -->
        <n-form-item
          :label="t('approval.comment')"
          :label-props="{ for: 'comment' }"
          :required="modalAction !== 'approve'"
        >
          <n-input
            v-model:value="comment"
            type="textarea"
            :placeholder="
              modalAction === 'approve'
                ? t('approval.optionalComment')
                : t('approval.requiredReason')
            "
            :rows="4"
          />
        </n-form-item>

        <!-- Validation Message -->
        <n-alert v-if="modalAction !== 'approve' && !comment" type="warning" size="small">
          {{ t('approval.commentRequired', { action: modalAction === 'reject' ? t('approval.rejection') : t('approval.return') }) }}
        </n-alert>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { Request } from '~/types/request'
import { NButton, NTag, useMessage } from 'naive-ui'
import { h } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['approver', 'dept_admin', 'super_admin'],
})

const { t } = useI18n()
const message = useMessage()
const { getApprovalInbox, approveRequest, rejectRequest, returnRequest } = useApprovals()

const showModal = ref(false)
const modalAction = ref<'approve' | 'reject' | 'return'>('approve')
const selectedRequest = ref<Request | null>(null)
const comment = ref('')
const submitting = ref(false)

// Fetch approvals (backend returns simple array, not paginated)
const { data: approvals, pending: loading, error, refresh } = await getApprovalInbox()

const pagination = reactive({
  page: 1,
  pageSize: 10,
})

const modalTitle = computed(() => {
  if (!selectedRequest.value) return ''
  const action = modalAction.value === 'approve' ? t('approval.approve') : modalAction.value === 'reject' ? t('approval.reject') : t('approval.return')
  return `${action} ${t('request.requestId', { id: selectedRequest.value.id })}`
})

// Column definitions
const columns = computed<DataTableColumns<Request>>(() => [
  {
    title: t('request.id'),
    key: 'id',
    width: 80,
  },
  {
    title: t('request.title'),
    key: 'title',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: t('approval.requester'),
    key: 'requester',
    width: 150,
    render(row) {
      return row.user?.name || t('common.unknown')
    },
  },
  {
    title: t('request.category'),
    key: 'category',
    width: 120,
    render(row) {
      return h(NTag, { size: 'small' }, { default: () => t(`category.${row.category}`) })
    },
  },
  {
    title: t('request.amount'),
    key: 'amount',
    width: 150,
    render(row) {
      return `¥${row.amount.toLocaleString()}`
    },
  },
  {
    title: t('request.status'),
    key: 'status',
    width: 120,
    render(row) {
      const type = row.status === 'SUBMITTED' ? 'info' : 'warning'
      return h(
        NTag,
        { type, size: 'small' },
        { default: () => t(`status.${row.status}`) }
      )
    },
  },
  {
    title: t('approval.submitted'),
    key: 'created_at',
    width: 120,
    render(row) {
      return new Date(row.created_at).toLocaleDateString()
    },
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 280,
    render(row) {
      return h('div', { class: 'tw-space-x-2' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'success',
            onClick: () => openModal(row, 'approve'),
          },
          { default: () => t('approval.approve') }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => openModal(row, 'reject'),
          },
          { default: () => t('approval.reject') }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'warning',
            onClick: () => openModal(row, 'return'),
          },
          { default: () => t('approval.return') }
        ),
      ])
    },
  },
])

// Modal actions
const openModal = (request: Request, action: 'approve' | 'reject' | 'return') => {
  selectedRequest.value = request
  modalAction.value = action
  comment.value = ''
  showModal.value = true
}

const handleModalCancel = () => {
  showModal.value = false
  selectedRequest.value = null
  comment.value = ''
  return false
}

const handleModalSubmit = async () => {
  if (!selectedRequest.value) return false

  // Validate comment for reject/return actions
  if (modalAction.value !== 'approve' && !comment.value.trim()) {
    message.error(t('approval.commentRequiredError'))
    return false
  }

  submitting.value = true
  try {
    const requestId = selectedRequest.value.id
    const data = comment.value ? { comment: comment.value } : undefined

    switch (modalAction.value) {
      case 'approve':
        await approveRequest(requestId, data)
        message.success(t('approval.requestApproved'))
        break
      case 'reject':
        await rejectRequest(requestId, data!)
        message.error(t('approval.requestRejected'))
        break
      case 'return':
        await returnRequest(requestId, data!)
        message.warning(t('approval.requestReturned'))
        break
    }

    showModal.value = false
    selectedRequest.value = null
    comment.value = ''
    await refresh()
    return true
  } catch (err: any) {
    message.error(err.message || t('approval.failedToProcess'))
    return false
  } finally {
    submitting.value = false
  }
}
</script>
