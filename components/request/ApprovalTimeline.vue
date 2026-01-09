<template>
  <div>
    <n-h3>{{ t('approval.approvalTimeline') }}</n-h3>

    <n-timeline v-if="steps && steps.length > 0" class="tw-mt-4">
      <n-timeline-item
        v-for="step in steps"
        :key="step.id"
        :type="getStepType(step.status)"
        :title="`${t('approval.step')} ${step.step_number}`"
      >
        <template #icon>
          <n-icon v-if="step.status === 'approved'" color="green">
            <CheckmarkCircle />
          </n-icon>
          <n-icon v-else-if="step.status === 'rejected'" color="red">
            <CloseCircle />
          </n-icon>
          <n-icon v-else-if="step.status === 'returned'" color="orange">
            <ReturnUpBack />
          </n-icon>
          <n-icon v-else color="gray">
            <TimeOutline />
          </n-icon>
        </template>

        <n-space vertical size="small">
          <n-text :depth="step.status === 'pending' ? 3 : 1">
            {{ t('approval.approver') }}: {{ step.approver?.name || t('common.unknown') }}
          </n-text>

          <n-text v-if="step.approver?.role?.name" depth="3" class="tw-text-sm">
            {{ getRoleName(step.approver.role.name) }}
          </n-text>

          <n-tag :type="getStepTagType(step.status)" :bordered="false" size="small">
            {{ t(`approval.${step.status}`) }}
          </n-tag>

          <n-text v-if="step.approved_at" depth="3" class="tw-text-sm">
            {{ formatDate(step.approved_at) }}
          </n-text>

          <n-text v-if="step.comment" class="tw-text-sm">
            <strong>{{ t('approval.comment') }}:</strong> {{ step.comment }}
          </n-text>
        </n-space>
      </n-timeline-item>
    </n-timeline>

    <n-empty v-else :description="t('approval.noPendingApprovals')" class="tw-py-8" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { CheckmarkCircle, CloseCircle, ReturnUpBack, TimeOutline } from '@vicons/ionicons5'
import type { ApprovalStep, ApprovalStepStatus } from '~/types/request'

interface Props {
  steps?: ApprovalStep[]
}

const props = defineProps<Props>()

const { t } = useI18n()

const getStepType = (status: ApprovalStepStatus): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  const typeMap: Record<ApprovalStepStatus, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
    approved: 'success',
    rejected: 'error',
    returned: 'warning',
    pending: 'default',
  }
  return typeMap[status] || 'default'
}

const getStepTagType = (status: ApprovalStepStatus): 'success' | 'error' | 'warning' | 'default' => {
  const typeMap: Record<ApprovalStepStatus, 'success' | 'error' | 'warning' | 'default'> = {
    approved: 'success',
    rejected: 'error',
    returned: 'warning',
    pending: 'default',
  }
  return typeMap[status] || 'default'
}

const getRoleName = (roleName: string): string => {
  const roleMap: Record<string, string> = {
    super_admin: t('admin.roleSuperAdmin'),
    dept_admin: t('admin.roleDeptAdmin'),
    approver: t('admin.roleApprover'),
    requester: t('auth.requester'),
  }
  return roleMap[roleName] || roleName
}

const formatDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy HH:mm')
  } catch {
    return dateStr
  }
}
</script>
