<template>
  <div class="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-gray-100">
    <div class="tw-absolute tw-top-4 tw-right-4">
      <LanguageSwitcher />
    </div>

    <n-card class="tw-w-full tw-max-w-md">
      <div class="tw-text-center tw-mb-8">
        <h1 class="tw-text-4xl tw-font-bold tw-text-gray-900 tw-mb-2">{{ t('common.appName') }}</h1>
        <p class="tw-text-gray-600">{{ t('auth.subtitle') }}</p>
      </div>

      <n-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        @submit.prevent="handleLogin"
      >
        <n-form-item :label="t('auth.email')" path="email">
          <n-input
            v-model:value="formState.email"
            type="email"
            :placeholder="t('auth.email')"
            :disabled="loading"
            size="large"
          />
        </n-form-item>

        <n-form-item :label="t('auth.password')" path="password">
          <n-input
            v-model:value="formState.password"
            type="password"
            :placeholder="t('auth.password')"
            :disabled="loading"
            size="large"
            show-password-on="click"
          />
        </n-form-item>

        <n-alert v-if="error" type="error" :title="error" closable class="tw-mb-4" @close="error = null" />

        <n-button
          type="primary"
          block
          size="large"
          :loading="loading"
          attr-type="submit"
          @click="handleLogin"
        >
          {{ loading ? t('common.loading') : t('auth.loginButton') }}
        </n-button>
      </n-form>

      <n-divider />

      <div class="tw-text-center">
        <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-3">{{ t('auth.demoAccounts') }}</p>
        <n-space vertical size="small">
          <n-text depth="3" class="tw-text-xs">
            <strong>{{ t('auth.superAdmin') }}:</strong> superadmin@deciflow.com
          </n-text>
          <n-text depth="3" class="tw-text-xs">
            <strong>{{ t('auth.deptAdmin') }}:</strong> deptadmin@deciflow.com
          </n-text>
          <n-text depth="3" class="tw-text-xs">
            <strong>{{ t('auth.approver') }}:</strong> approver@deciflow.com
          </n-text>
          <n-text depth="3" class="tw-text-xs">
            <strong>{{ t('auth.requester') }}:</strong> requester@deciflow.com
          </n-text>
          <n-text depth="3" class="tw-text-xs tw-mt-2">
            {{ t('auth.password') }}: <n-text code>password</n-text>
          </n-text>
        </n-space>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '~/components/common/LanguageSwitcher.vue'

definePageMeta({
  middleware: 'guest',
  layout: false,
})

const { login } = useAuth()
const { t } = useI18n()
const router = useRouter()

const formRef = ref<FormInst | null>(null)
const formState = reactive({
  email: '',
  password: '',
})

const rules = computed<FormRules>(() => ({
  email: [
    { required: true, message: t('validation.required', { field: t('auth.email') }), trigger: 'blur' },
    { type: 'email', message: t('validation.email'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('validation.required', { field: t('auth.password') }), trigger: 'blur' },
    { min: 6, message: t('validation.min', { field: t('auth.password'), min: '6 characters' }), trigger: 'blur' },
  ],
}))

const loading = ref(false)
const error = ref<string | null>(null)

const handleLogin = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true
    error.value = null

    await login(formState.email, formState.password)
    await router.push('/')
  } catch (err: any) {
    if (err?.message) {
      error.value = err.message
    } else {
      error.value = t('auth.invalidCredentials')
    }
  } finally {
    loading.value = false
  }
}
</script>
