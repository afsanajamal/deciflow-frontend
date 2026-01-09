<template>
  <n-tag :type="statusType" :bordered="false" size="small">
    {{ t(`status.${status}`) }}
  </n-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RequestStatus } from '~/types/request'

interface Props {
  status: RequestStatus
}

const props = defineProps<Props>()

const { t } = useI18n()

const statusType = computed(() => {
  const statusMap: Record<RequestStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    DRAFT: 'default',
    SUBMITTED: 'info',
    IN_REVIEW: 'info',
    APPROVED: 'success',
    REJECTED: 'error',
    RETURNED: 'warning',
    CANCELLED: 'default',
    ARCHIVED: 'default',
  }
  return statusMap[props.status] || 'default'
})
</script>
