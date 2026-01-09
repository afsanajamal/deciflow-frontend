<template>
  <div>
    <n-spin v-if="pending" :size="40" class="tw-flex tw-justify-center tw-py-8" />

    <n-alert v-else-if="error" type="error" class="tw-mb-4">
      {{ t('error.loadFailed', { resource: t('attachment.attachments') }) }}: {{ error.message }}
    </n-alert>

    <div v-else-if="attachments && attachments.length > 0" class="tw-space-y-2">
      <n-card
        v-for="attachment in attachments"
        :key="attachment.id"
        size="small"
        hoverable
      >
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <n-icon size="24" :color="getFileIconColor(attachment.mime_type)">
              <component :is="getFileIcon(attachment.mime_type)" />
            </n-icon>

            <div>
              <n-text class="tw-font-medium">{{ attachment.file_name }}</n-text>
              <div class="tw-flex tw-items-center tw-gap-3 tw-mt-1">
                <n-text depth="3" class="tw-text-sm">
                  {{ formatFileSize(attachment.file_size) }}
                </n-text>
                <n-text depth="3" class="tw-text-sm">
                  {{ formatDate(attachment.created_at) }}
                </n-text>
                <n-text v-if="attachment.uploader" depth="3" class="tw-text-sm">
                  {{ t('attachment.uploadedBy', { name: attachment.uploader.name }) }}
                </n-text>
              </div>
            </div>
          </div>

          <div class="tw-flex tw-gap-2">
            <n-button
              size="small"
              @click="handleDownload(attachment)"
              :loading="downloadingId === attachment.id"
            >
              <template #icon>
                <n-icon><DownloadOutline /></n-icon>
              </template>
              {{ t('common.download') }}
            </n-button>

            <n-popconfirm
              v-if="canDelete"
              @positive-click="handleDelete(attachment.id)"
            >
              <template #trigger>
                <n-button
                  size="small"
                  type="error"
                  :loading="deletingId === attachment.id"
                >
                  <template #icon>
                    <n-icon><TrashOutline /></n-icon>
                  </template>
                  {{ t('common.delete') }}
                </n-button>
              </template>
              {{ t('attachment.confirmDelete') }}
            </n-popconfirm>
          </div>
        </div>
      </n-card>
    </div>

    <n-empty
      v-else
      :description="t('attachment.noAttachments')"
      class="tw-py-8"
    />
  </div>
</template>

<script setup lang="ts">
import type { Attachment } from '~/types/attachment'
import {
  DocumentTextOutline,
  DocumentOutline,
  ImageOutline,
  DownloadOutline,
  TrashOutline,
} from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'

const props = defineProps<{
  requestId: number
  canDelete?: boolean
}>()

const emit = defineEmits<{
  deleted: []
}>()

const { t } = useI18n()
const message = useMessage()
const { getAttachments, downloadAttachment, deleteAttachment } = useAttachments()

const { data: attachments, pending, error, refresh } = await getAttachments(props.requestId)

const downloadingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return ImageOutline
  if (mimeType === 'application/pdf') return DocumentTextOutline
  return DocumentOutline
}

const getFileIconColor = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '#18a058'
  if (mimeType === 'application/pdf') return '#d03050'
  return '#2080f0'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = (bytes / Math.pow(k, i)).toFixed(2)
  return size + ' ' + sizes[i]
}

const formatDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

const handleDownload = async (attachment: Attachment) => {
  downloadingId.value = attachment.id
  try {
    await downloadAttachment(attachment.id, attachment.file_name)
    message.success(t('attachment.downloadStarted'))
  } catch (err: any) {
    message.error(err.message || t('attachment.downloadFailed'))
  } finally {
    downloadingId.value = null
  }
}

const handleDelete = async (attachmentId: number) => {
  deletingId.value = attachmentId
  try {
    await deleteAttachment(attachmentId)
    message.success(t('attachment.deleted'))
    await refresh()
    emit('deleted')
  } catch (err: any) {
    message.error(err.message || t('attachment.deleteFailed'))
  } finally {
    deletingId.value = null
  }
}

defineExpose({
  refresh,
})
</script>
