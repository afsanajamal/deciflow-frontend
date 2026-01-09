<template>
  <div>
    <n-page-header :title="t('dashboard.welcomeBack', { name: user?.name })" :subtitle="t('nav.dashboard')" class="tw-mb-6" />

    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" class="tw-mb-6">
      <n-grid-item>
        <n-card>
          <n-statistic :label="t('dashboard.totalRequests')" :value="stats.totalRequests">
            <template #prefix>
              <n-icon size="24">
                <DocumentTextOutline />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card>
          <n-statistic :label="t('dashboard.draftRequests')" :value="stats.draftRequests">
            <template #prefix>
              <n-icon size="24">
                <CreateOutline />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card>
          <n-statistic :label="t('dashboard.pendingApprovals')" :value="stats.pendingApprovals">
            <template #prefix>
              <n-icon size="24">
                <TimeOutline />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card>
          <n-statistic :label="t('dashboard.approvedRequests')" :value="stats.approvedRequests">
            <template #prefix>
              <n-icon size="24">
                <CheckmarkCircleOutline />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card :title="t('dashboard.quickActions')" class="tw-mb-6">
      <n-space>
        <n-button type="primary" @click="navigateTo('/requests/new')">
          {{ t('request.createNew') }}
        </n-button>
        <n-button @click="navigateTo('/requests')">
          {{ t('dashboard.viewMyRequests') }}
        </n-button>
        <n-button v-if="canApprove" @click="navigateTo('/approvals/inbox')">
          {{ t('dashboard.viewApprovalInbox') }}
        </n-button>
      </n-space>
    </n-card>

    <n-card :title="t('dashboard.recentActivity')">
      <n-empty v-if="stats.totalRequests === 0" :description="t('dashboard.noRequests')" class="tw-py-8">
        <template #extra>
          <n-button type="primary" @click="navigateTo('/requests/new')">
            {{ t('dashboard.createFirstRequest') }}
          </n-button>
        </template>
      </n-empty>
      <n-text v-else depth="3">{{ t('dashboard.recentRequestsInfo') }}</n-text>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { DocumentTextOutline, CreateOutline, TimeOutline, CheckmarkCircleOutline } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const { user, canApprove } = useAuth()

const stats = reactive({
  totalRequests: 0,
  draftRequests: 0,
  pendingApprovals: 0,
  approvedRequests: 0,
})

onMounted(() => {
  // TODO: Fetch actual stats from API
  stats.totalRequests = 0
  stats.draftRequests = 0
  stats.pendingApprovals = 0
  stats.approvedRequests = 0
})
</script>
