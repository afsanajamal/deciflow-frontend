// Attachments composable
import type { Attachment } from '~/types/attachment'

export function useAttachments() {
  const config = useRuntimeConfig()

  /**
   * Get attachments for a request
   */
  const getAttachments = (requestId: number) => {
    return useApi<Attachment[]>(`/v1/requests/${requestId}/attachments`)
  }

  /**
   * Upload attachment to a request
   */
  const uploadAttachment = async (
    requestId: number,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Attachment> => {
    const formData = new FormData()
    formData.append('file', file)

    const authStore = useAuthStore()
    const token = authStore.token

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            onProgress(progress)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response.data || response)
          } catch (err) {
            reject(new Error('Failed to parse response'))
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText)
            reject(new Error(error.message || 'Upload failed'))
          } catch {
            reject(new Error('Upload failed'))
          }
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'))
      })

      xhr.open('POST', `${config.public.apiBase}/v1/requests/${requestId}/attachments`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.setRequestHeader('Accept', 'application/json')
      xhr.send(formData)
    })
  }

  /**
   * Download attachment
   */
  const downloadAttachment = async (attachmentId: number, fileName: string) => {
    const authStore = useAuthStore()
    const token = authStore.token

    try {
      const response = await fetch(
        `${config.public.apiBase}/v1/attachments/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      throw new Error(err.message || 'Failed to download file')
    }
  }

  /**
   * Delete attachment
   */
  const deleteAttachment = async (attachmentId: number): Promise<void> => {
    return apiCall<void>(`/v1/attachments/${attachmentId}`, {
      method: 'DELETE',
    })
  }

  return {
    getAttachments,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
  }
}
