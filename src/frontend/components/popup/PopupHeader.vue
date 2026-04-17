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
    <!-- 目录与发起agent信息（纯白底黑字，两行文本常显） -->
    <div class="mt-1.5 ml-6 text-sm leading-5 text-black">
      <div class="break-all">
        <span class="font-medium">目录：</span>
        <span>{{ displayFolder }}</span>
      </div>
      <div class="break-all">
        <span class="font-medium">Agent：</span>
        <span>{{ displayAgent }}</span>
      </div>
      <div v-if="props.workingDirectory" class="break-all text-black">
        <span class="font-medium">路径：</span>
        <span>{{ props.workingDirectory }}</span>
      </div>
    </div>
  </div>
</template>
