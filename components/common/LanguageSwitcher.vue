<template>
  <n-dropdown :options="languageOptions" @select="handleSelect">
    <n-button text>
      <n-icon size="20" class="tw-mr-2">
        <LanguageOutline />
      </n-icon>
      {{ currentLocaleName }}
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { LanguageOutline } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languageOptions = [
  { label: 'English', key: 'en' },
  { label: '日本語', key: 'ja' },
]

const currentLocaleName = computed(() => {
  return locale.value === 'ja' ? '日本語' : 'English'
})

const handleSelect = (key: string) => {
  locale.value = key
}
</script>
