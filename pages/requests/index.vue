<template>
  <div>
    <n-page-header :title="t('nav.myRequests')" :subtitle="t('request.viewAndManage')">
      <template #extra>
        <n-button type="primary" @click="navigateTo('/requests/new')">
          {{ t('request.createNew') }}
        </n-button>
      </template>
    </n-page-header>

    <n-card class="tw-mt-6">
      <n-space vertical :size="16">
        <!-- Filters -->
        <n-space>
          <n-select
            v-model:value="filters.status"
            :options="statusOptions"
            :placeholder="t('request.filterByStatus')"
            clearable
            style="width: 200px"
            @update:value="fetchRequests"
          />
          <n-select
            v-model:value="filters.category"
            :options="categoryOptions"
            :placeholder="t('request.filterByCategory')"
            clearable
            style="width: 200px"
            @update:value="fetchRequests"
          />
        </n-space>

        <!-- Requests Table -->
        <n-data-table
          :columns="columns"
          :data="requests"
          :loading="loading"
          :pagination="pagination"
          @update:page="handlePageChange"
        />

        <!-- Empty State -->
        <n-empty
          v-if="!loading && requests.length === 0"
          :description="t('request.noRequestsFound')"
          class="tw-py-8"
        >
          <template #extra>
            <n-button type="primary" @click="navigateTo('/requests/new')">
              {{ t('dashboard.createFirstRequest') }}
            </n-button>
          </template>
        </n-empty>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { Request, RequestStatus, RequestCategory } from '~/types/request'
import { NButton, NTag } from 'naive-ui'
import { h } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const { listRequests } = useRequests()
const router = useRouter()

const loading = ref(false)
const requests = ref<Request[]>([])
const filters = reactive({
  status: null as RequestStatus | null,
  category: null as RequestCategory | null,
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageCount: 1,
  itemCount: 0,
})

const statusOptions = computed(() => [
  { label: t('status.DRAFT'), value: 'DRAFT' },
  { label: t('status.SUBMITTED'), value: 'SUBMITTED' },
  { label: t('status.IN_REVIEW'), value: 'IN_REVIEW' },
  { label: t('status.APPROVED'), value: 'APPROVED' },
  { label: t('status.REJECTED'), value: 'REJECTED' },
  { label: t('status.RETURNED'), value: 'RETURNED' },
  { label: t('status.CANCELLED'), value: 'CANCELLED' },
  { label: t('status.ARCHIVED'), value: 'ARCHIVED' },
])

const categoryOptions = computed(() => [
  { label: t('category.EQUIPMENT'), value: 'EQUIPMENT' },
  { label: t('category.SOFTWARE'), value: 'SOFTWARE' },
  { label: t('category.SERVICE'), value: 'SERVICE' },
  { label: t('category.TRAVEL'), value: 'TRAVEL' },
])

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
      return h(
        NTag,
        { type: getStatusType(row.status), size: 'small' },
        { default: () => t(`status.${row.status}`) }
      )
    },
  },
  {
    title: t('request.createdAt'),
    key: 'created_at',
    width: 120,
    render(row) {
      return new Date(row.created_at).toLocaleDateString()
    },
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 100,
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          onClick: () => router.push(`/requests/${row.id}`),
        },
        { default: () => t('common.view') }
      )
    },
  },
])

const fetchRequests = async () => {
  loading.value = true
  try {
    const queryFilters: any = {
      page: pagination.page.toString(),
      per_page: pagination.pageSize.toString(),
      my: 'true', // Always filter to current user's requests on "My Requests" page
    }

    if (filters.status) {
      queryFilters.status = filters.status
    }
    if (filters.category) {
      queryFilters.category = filters.category
    }

    const { data, error } = await listRequests(queryFilters)

    if (error.value) {
      throw error.value
    }

    if (data.value) {
      requests.value = data.value.data
      pagination.pageCount = data.value.last_page
      pagination.itemCount = data.value.total
    }
  } catch (err: any) {
    console.error('Failed to fetch requests:', err)
    requests.value = []
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchRequests()
}

// Fetch requests on mount
onMounted(() => {
  fetchRequests()
})
</script>
