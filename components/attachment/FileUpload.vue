<template>
  <div class="tw-p-4">
    <n-upload
      :custom-request="handleUpload"
      :max="10"
      :show-file-list="false"
      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
      @change="handleChange"
    >
      <n-upload-dragger>
        <div class="tw-py-8 tw-text-center">
          <n-icon size="48" :depth="3" class="tw-mx-auto">
            <CloudUploadOutline />
          </n-icon>
          <div class="tw-mt-4 tw-text-base">
            {{ t('attachment.clickOrDrag') }}
          </div>
          <div class="tw-mt-2 tw-text-sm tw-text-gray-500">
            {{ t('attachment.maxFileSize') }}
          </div>
        </div>
      </n-upload-dragger>
    </n-upload>

    <!-- Upload Progress List -->
    <div v-if="uploadQueue.length > 0" class="tw-mt-4 tw-space-y-2">
      <n-card
        v-for="item in uploadQueue"
        :key="item.file.name"
        size="small"
      >
        <div class="tw-flex tw-items-center tw-gap-3">
          <n-icon size="24">
            <DocumentOutline v-if="item.status !== 'error'" />
            <CloseCircleOutline v-else color="red" />
          </n-icon>

          <div class="tw-flex-1">
            <div class="tw-flex tw-items-center tw-justify-between">
              <n-text>{{ item.file.name }}</n-text>
              <n-text depth="3" class="tw-text-sm">
                {{ formatFileSize(item.file.size) }}
              </n-text>
            </div>

            <n-progress
              v-if="item.status === 'uploading'"
              type="line"
              :percentage="item.progress"
              :show-indicator="false"
              class="tw-mt-1"
            />

            <n-text
              v-if="item.status === 'error'"
              type="error"
              class="tw-block tw-mt-1 tw-text-sm"
            >
              {{ item.error }}
            </n-text>

            <n-text
              v-if="item.status === 'success'"
              type="success"
              class="tw-block tw-mt-1 tw-text-sm"
            >
              {{ t('attachment.uploadComplete') }}
            </n-text>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UploadCustomRequestOptions, UploadFileInfo } from 'naive-ui'
import type { UploadProgress } from '~/types/attachment'
import { CloudUploadOutline, DocumentOutline, CloseCircleOutline } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  requestId: number
}>()

const emit = defineEmits<{
  success: []
  error: [error: string]
}>()

const { t } = useI18n()
const message = useMessage()
const { uploadAttachment } = useAttachments()

const uploadQueue = ref<UploadProgress[]>([])

const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
]

const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return t('attachment.fileSizeExceeds')
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return t('attachment.fileTypeNotSupported')
  }

  return null
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = (bytes / Math.pow(k, i)).toFixed(2)
  return size + ' ' + sizes[i]
}

const handleChange = (options: { fileList: UploadFileInfo[] }) => {
  // Called when files are selected
}

const handleUpload = async (options: UploadCustomRequestOptions) => {
  const { file } = options

  const validationError = validateFile(file.file as File)
  if (validationError) {
    message.error(validationError)
    options.onError()
    return
  }

  const uploadItem: UploadProgress = {
    file: file.file as File,
    progress: 0,
    status: 'uploading',
  }
  uploadQueue.value.push(uploadItem)

  try {
    const attachment = await uploadAttachment(
      props.requestId,
      file.file as File,
      (progress) => {
        uploadItem.progress = progress
      }
    )

    uploadItem.status = 'success'
    uploadItem.attachment = attachment

    message.success(t('attachment.fileUploaded', { name: file.name }))
    emit('success')

    setTimeout(() => {
      uploadQueue.value = uploadQueue.value.filter((item) => item !== uploadItem)
    }, 2000)

    options.onFinish()
  } catch (err: any) {
    uploadItem.status = 'error'
    const errorMessage = err.message || t('attachment.uploadFailed')
    uploadItem.error = errorMessage

    message.error(errorMessage)
    emit('error', errorMessage)

    setTimeout(() => {
      uploadQueue.value = uploadQueue.value.filter((item) => item !== uploadItem)
    }, 5000)

    options.onError()
  }
}
</script>
