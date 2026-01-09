<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-layout has-sider position="absolute">
      <n-layout-sider
        bordered
        :width="240"
        :native-scrollbar="false"
        class="tw-h-screen"
      >
        <div class="tw-p-6">
          <h1 class="tw-text-2xl tw-font-bold tw-text-blue-600">DeciFlow</h1>
        </div>
        <n-menu
          :value="activeKey"
          :options="menuOptions"
          @update:value="handleMenuSelect"
        />
      </n-layout-sider>

      <n-layout>
        <n-layout-header bordered class="tw-h-16 tw-flex tw-items-center tw-px-6 tw-justify-end">
          <n-space align="center">
            <LanguageSwitcher />
            <n-divider vertical />
            <n-text>{{ user?.name }}</n-text>
            <n-tag :type="roleTagType" size="small">
              {{ user?.role?.name }}
            </n-tag>
            <n-button text @click="handleLogout">
              <template #icon>
                <n-icon>
                  <LogOutOutline />
                </n-icon>
              </template>
              {{ t('auth.logout') }}
            </n-button>
          </n-space>
        </n-layout-header>

        <n-layout-content content-style="padding: 24px;" :native-scrollbar="false">
          <slot />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { MenuOption } from 'naive-ui'
import { NIcon } from 'naive-ui'
import { LogOutOutline, HomeOutline, DocumentTextOutline, CheckmarkCircleOutline, SettingsOutline } from '@vicons/ionicons5'
import { h } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '~/components/common/LanguageSwitcher.vue'

const { logout, user, isAdmin, isSuperAdmin, canApprove } = useAuth()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const activeKey = computed(() => route.path)

const themeOverrides = {
  common: {
    primaryColor: '#3B82F6',
    primaryColorHover: '#2563EB',
    primaryColorPressed: '#1D4ED8',
  },
}

const roleTagType = computed(() => {
  switch (user.value?.role?.name) {
    case 'super_admin':
      return 'error'
    case 'dept_admin':
      return 'warning'
    case 'approver':
      return 'info'
    case 'requester':
      return 'success'
    default:
      return 'default'
  }
})

const renderIcon = (icon: any) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = computed<MenuOption[]>(() => {
  const options: MenuOption[] = [
    {
      label: t('nav.dashboard'),
      key: '/',
      icon: renderIcon(HomeOutline),
    },
    {
      label: t('nav.myRequests'),
      key: '/requests',
      icon: renderIcon(DocumentTextOutline),
    },
  ]

  if (canApprove.value) {
    options.push({
      label: t('nav.approvalInbox'),
      key: '/approvals/inbox',
      icon: renderIcon(CheckmarkCircleOutline),
    })
  }

  if (isAdmin.value) {
    const adminChildren: MenuOption[] = [
      {
        label: t('nav.allRequests'),
        key: '/admin/requests',
      },
      {
        label: t('nav.approvalRules'),
        key: '/admin/rules',
      },
    ]

    if (isSuperAdmin.value) {
      adminChildren.push({
        label: t('nav.auditLogs'),
        key: '/admin/audit',
      })
    }

    options.push({
      label: t('nav.admin'),
      key: 'admin',
      icon: renderIcon(SettingsOutline),
      children: adminChildren,
    })
  }

  return options
})

const handleMenuSelect = (key: string) => {
  router.push(key)
}

const handleLogout = async () => {
  await logout()
}
</script>
