<template>
  <div>
    <n-page-header :title="t('nav.auditLogs')" :subtitle="t('audit.systemWideLogs')" />

    <n-card class="tw-mt-6">
      <!-- Loading State -->
      <n-spin v-if="loading" :size="60" class="tw-flex tw-justify-center tw-py-20" />

      <!-- Error State -->
      <n-alert v-else-if="error" type="error">
        {{ t('error.failedToLoadAuditLogs') }}: {{ error.message }}
      </n-alert>

      <!-- Audit Logs Table -->
      <div v-else>
        <n-data-table
          :columns="columns"
          :data="auditLogs"
          :pagination="pagination"
          @update:page="handlePageChange"
        />

        <!-- Empty State -->
        <n-empty
          v-if="auditLogs.length === 0"
          :description="t('audit.noLogsFound')"
          class="tw-py-8"
        />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { AuditLog } from '~/types/audit'
import { NTag } from 'naive-ui'
import { h } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['super_admin'],
})

const { t } = useI18n()
const { getAuditLogs } = useAudit()

const loading = ref(false)
const error = ref<Error | null>(null)
const auditLogs = ref<AuditLog[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 20,
  pageCount: 1,
  itemCount: 0,
})

const getActionType = (action: string) => {
  const actionMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    created: 'success',
    submitted: 'info',
    approved: 'success',
    rejected: 'error',
    returned: 'warning',
    cancelled: 'default',
    archived: 'default',
    updated: 'info',
  }
  return actionMap[action] || 'default'
}

const columns = computed<DataTableColumns<AuditLog>>(() => [
  {
    title: t('audit.id'),
    key: 'id',
    width: 80,
  },
  {
    title: t('audit.request'),
    key: 'request',
    width: 100,
    render(row) {
      return `#${row.request_id}`
    },
  },
  {
    title: t('audit.user'),
    key: 'user',
    width: 150,
    render(row) {
      return row.user?.name || t('common.unknown')
    },
  },
  {
    title: t('audit.action'),
    key: 'action',
    width: 120,
    render(row) {
      return h(
        NTag,
        { type: getActionType(row.action), size: 'small' },
        { default: () => row.action.toUpperCase() }
      )
    },
  },
  {
    title: t('audit.statusChange'),
    key: 'status_change',
    width: 200,
    render(row) {
      if (row.from_status && row.to_status) {
        return `${row.from_status} → ${row.to_status}`
      }
      if (row.to_status) {
        return `→ ${row.to_status}`
      }
      return 'N/A'
    },
  },
  {
    title: t('audit.details'),
    key: 'meta',
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      if (row.meta && row.meta.comment) {
        return row.meta.comment
      }
      return row.meta ? JSON.stringify(row.meta) : 'N/A'
    },
  },
  {
    title: t('audit.timestamp'),
    key: 'created_at',
    width: 180,
    render(row) {
      return new Date(row.created_at).toLocaleString()
    },
  },
])

const fetchAuditLogs = async () => {
  loading.value = true
  error.value = null
  try {
    const { data, error: fetchError } = await getAuditLogs(
      pagination.page,
      pagination.pageSize
    )

    if (fetchError.value) {
      throw fetchError.value
    }

    if (data.value) {
      auditLogs.value = data.value.data
      pagination.pageCount = data.value.last_page
      pagination.itemCount = data.value.total
    }
  } catch (err: any) {
    error.value = err
    console.error('Failed to fetch audit logs:', err)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchAuditLogs()
}

// Fetch audit logs on mount
onMounted(() => {
  fetchAuditLogs()
})
</script>
