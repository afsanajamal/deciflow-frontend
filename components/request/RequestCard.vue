<template>
  <n-card
    :title="request.title"
    hoverable
    class="tw-cursor-pointer"
    @click="handleClick"
  >
    <template #header-extra>
      <RequestStatusBadge :status="request.status" />
    </template>

    <n-space vertical size="small">
      <n-text depth="3" class="tw-text-sm">
        {{ t('request.category') }}: {{ t(`category.${request.category}`) }}
      </n-text>

      <n-text depth="3" class="tw-text-sm">
        {{ t('request.amount') }}: ¥{{ request.amount.toLocaleString() }}
      </n-text>

      <n-text v-if="request.description" depth="3" class="tw-text-sm tw-line-clamp-2">
        {{ request.description }}
      </n-text>

      <n-text depth="3" class="tw-text-xs">
        {{ t('request.createdAt') }}: {{ formatDate(request.created_at) }}
      </n-text>
    </n-space>

    <template #footer>
      <n-space justify="space-between" align="center">
        <n-text depth="3" class="tw-text-xs">
          ID: #{{ request.id }}
        </n-text>
        <n-button text type="primary">
          {{ t('common.view') }} →
        </n-button>
      </n-space>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import type { Request } from '~/types/request'
import RequestStatusBadge from './RequestStatusBadge.vue'

interface Props {
  request: Request
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [request: Request]
}>()

const { t } = useI18n()

const formatDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

const handleClick = () => {
  emit('click', props.request)
}
</script>
