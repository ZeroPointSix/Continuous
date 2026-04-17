<script setup lang="ts">
import { computed } from 'vue'
import ThemeIcon from '../common/ThemeIcon.vue'

interface Props {
  currentTheme?: string
  loading?: boolean
  showMainLayout?: boolean
  alwaysOnTop?: boolean
  workingDirectory?: string
  sourceAgent?: string
}

interface Emits {
  themeChange: [theme: string]
  openMainLayout: []
  toggleAlwaysOnTop: []
}

const props = withDefaults(defineProps<Props>(), {
  currentTheme: 'dark',
  loading: false,
  showMainLayout: false,
  alwaysOnTop: false,
  workingDirectory: '',
  sourceAgent: '',
})

const emit = defineEmits<Emits>()

const projectFolderName = computed(() => {
  if (!props.workingDirectory)
    return ''
  const sep = props.workingDirectory.includes('\\') ? '\\' : '/'
  const parts = props.workingDirectory.split(sep).filter(Boolean)
  return parts[parts.length - 1] || ''
})

const displayAgent = computed(() => {
  return (props.sourceAgent || '').trim() || 'unknown'
})

const displayFolder = computed(() => {
  return projectFolderName.value || 'unknown'
})

function handleThemeChange() {
  const nextTheme = props.currentTheme === 'light' ? 'dark' : 'light'
  emit('themeChange', nextTheme)
}

function handleOpenMainLayout() {
  emit('openMainLayout')
}

function handleToggleAlwaysOnTop() {
  emit('toggleAlwaysOnTop')
}
</script>

<template>
  <div class="px-4 py-3 select-none bg-white">
    <div class="flex items-center justify-between">
      <!-- 左侧：标题 -->
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full bg-primary-500" />
        <h1 class="text-base font-medium text-black-900">
          寸止 - 告别AI提前终止烦恼，助力AI更加持久
        </h1>
      </div>

      <!-- 右侧：操作按钮 -->
      <n-space size="small">
        <n-button
          size="small"
          quaternary
          circle
          :title="props.alwaysOnTop ? '取消置顶' : '窗口置顶'"
          @click="handleToggleAlwaysOnTop"
        >
          <template #icon>
            <div
              :class="props.alwaysOnTop ? 'i-carbon-pin-filled' : 'i-carbon-pin'"
              class="w-4 h-4 text-black-700"
            />
          </template>
        </n-button>
        <n-button
          size="small"
          quaternary
          circle
          :title="props.showMainLayout ? '返回聊天' : '打开设置'"
          @click="handleOpenMainLayout"
        >
          <template #icon>
            <div
              :class="props.showMainLayout ? 'i-carbon-chat' : 'i-carbon-settings'"
              class="w-4 h-4 text-black-700"
            />
          </template>
        </n-button>
        <n-button
          size="small"
          quaternary
          circle
          :title="`切换到${props.currentTheme === 'light' ? '深色' : '浅色'}主题`"
          @click="handleThemeChange"
        >
          <template #icon>
            <ThemeIcon :theme="props.currentTheme" class="w-4 h-4 text-black-700" />
          </template>
        </n-button>
      </n-space>
    </div>
    <!-- 目录与发起agent信息（默认直接显示，不隐藏） -->
    <div class="mt-1.5 ml-6 flex flex-wrap items-center gap-2 text-sm">
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 border border-gray-300 text-black-800">
        <span class="i-carbon-folder w-3 h-3" />
        <span class="font-medium">目录:</span>
        <span>{{ displayFolder }}</span>
      </span>
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 border border-gray-300 text-black-800">
        <span class="i-carbon-user w-3 h-3" />
        <span class="font-medium">Agent:</span>
        <span>{{ displayAgent }}</span>
      </span>
      <span v-if="props.workingDirectory" class="text-gray-600 break-all">
        {{ props.workingDirectory }}
      </span>
    </div>
  </div>
</template>
