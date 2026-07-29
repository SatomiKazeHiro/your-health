# 久坐提醒 MVP 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Tauri 2.x + Vue 3 + TS 构建桌面健康软件 MVP,核心是久坐闹钟提醒(开始/中断/结束 + 圆环倒计时 + 强提醒弹窗)

**Architecture:** 前端主导方案(方案甲)。倒计时逻辑在 Pinia store 中,前端 `setInterval` + `visibilitychange` 补偿。Tauri 端只负责系统能力(配置持久化、窗口控制、铃声播放)。状态机: idle ↔ running ↔ paused,归零后进入 alerting。

**Tech Stack:** Tauri 2.x, Vue 3.4+, TypeScript 5.x, Vite 5.x, Pinia 2.x, vue-router 4.x, @tauri-apps/plugin-store, Vitest, Vue Test Utils, Playwright, Rust 1.70+

---

## 文件结构(创建/修改一览)

```
your-health/
├── src/
│   ├── App.vue                              [创建 Task 11]
│   ├── main.ts                              [创建 Task 1]
│   ├── router/index.ts                      [创建 Task 10]
│   ├── views/
│   │   ├── HomeView.vue                     [创建 Task 11]
│   │   ├── SettingsView.vue                 [创建 Task 12]
│   │   └── AlertView.vue                    [创建 Task 13]
│   ├── stores/
│   │   └── timerStore.ts                    [创建 Task 4]
│   ├── composables/
│   │   ├── useTimer.ts                      [创建 Task 5]
│   │   ├── useAudio.ts                      [创建 Task 16]
│   │   └── useConfig.ts                     [创建 Task 15]
│   ├── components/
│   │   ├── ProgressRing.vue                 [创建 Task 6]
│   │   ├── CountdownText.vue                [创建 Task 7]
│   │   └── PillButton.vue                   [创建 Task 8]
│   ├── assets/
│   │   ├── sounds/bell-{1..5}.wav           [创建 Task 2]
│   │   └── styles/
│   │       ├── theme.css                    [创建 Task 9]
│   │       └── main.css                     [创建 Task 9]
│   ├── i18n/zh-CN.ts                        [创建 Task 3]
│   └── types/index.ts                       [创建 Task 3]
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                          [创建 Task 1]
│   │   ├── lib.rs                           [创建 Task 14]
│   │   └── commands/
│   │       ├── mod.rs                       [创建 Task 14]
│   │       ├── config.rs                    [创建 Task 14]
│   │       └── window.rs                    [创建 Task 14]
│   ├── tauri.conf.json                      [修改 Task 14]
│   ├── capabilities/default.json            [修改 Task 14]
│   └── Cargo.toml                           [创建 Task 1]
├── tests/
│   └── e2e/reminder-flow.spec.ts            [创建 Task 20]
├── package.json                             [创建/修改 Task 1/2]
├── tsconfig.json                            [创建 Task 1]
├── vite.config.ts                           [创建 Task 1]
├── vitest.config.ts                         [创建 Task 4]
└── README.md                                [创建 Task 21]
```

---

## 任务 1:脚手架 — 初始化 Tauri + Vue 3 + TS 项目

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.ts`, `src/App.vue`
- Create: `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`, `src-tauri/build.rs`, `src-tauri/icons/`(默认图标)

- [ ] **Step 1: 用 Tauri 官方模板创建项目**

由于官方 CLI 是交互式的,直接生成:

```bash
cd /d/Git
npm create tauri-app@latest -- your-health --manager npm --template vue-ts --identifier com.yourhealth.app --yes
```

预期:`your-health/` 目录下生成完整项目结构。

- [ ] **Step 2: 移动生成的项目到正确位置**

如果 CLI 在 `your-health/` 内又创建了子目录,把内容上移一层:

```bash
ls -la /d/Git/your-health/
```

预期:看到 `package.json`, `src/`, `src-tauri/`, `vite.config.ts` 等。

- [ ] **Step 3: 安装依赖并验证 build**

```bash
cd /d/Git/your-health
npm install
npm run build
```

预期:无错误,生成 `dist/` 目录。

- [ ] **Step 4: 验证 dev server**

```bash
npm run tauri dev
```

预期:Tauri 窗口打开,显示默认的 Vue 3 + Vite logo 页面。**验证完成后关闭窗口(Ctrl+C)**。

- [ ] **Step 5: 修改 src/App.vue 为最小占位内容**

```vue
<script setup lang="ts">
</script>

<template>
  <main>
    <h1>Your Health</h1>
  </main>
</template>
```

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: scaffold Tauri+Vue3+TS project"
```

---

## 任务 2:安装运行时依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装运行时依赖**

```bash
cd /d/Git/your-health
npm install pinia@^2.1.0 vue-router@^4.2.0 @tauri-apps/plugin-store@^2.0.0
```

预期:`package.json` 的 `dependencies` 包含上述包。

- [ ] **Step 2: 安装开发依赖**

```bash
npm install -D vitest@^1.0.0 @vue/test-utils@^2.4.0 jsdom@^23.0.0 @vitest/coverage-v8@^1.0.0
```

预期:`package.json` 的 `devDependencies` 包含上述包。

- [ ] **Step 3: 添加 npm scripts 到 package.json**

修改 `package.json` 的 `scripts` 段:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:rust": "cd src-tauri && cargo test"
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add package.json package-lock.json
git commit -m "feat: add runtime and dev dependencies (pinia, router, vitest)"
```

---

## 任务 3:定义核心类型

**Files:**
- Create: `src/types/index.ts`, `src/i18n/zh-CN.ts`

- [ ] **Step 1: 创建类型定义文件**

创建 `src/types/index.ts`:

```typescript
// 状态机状态
export type TimerState = 'idle' | 'running' | 'paused' | 'alerting'

// 时长选项
export const DURATION_OPTIONS = [30, 45, 60, 90] as const
export type DurationOption = (typeof DURATION_OPTIONS)[number]

// 铃声选项
export const SOUND_OPTIONS = [
  { id: 'bell-1', label: '清脆铃声' },
  { id: 'bell-2', label: '柔和提示' },
  { id: 'bell-3', label: '鸟鸣叮咚' },
  { id: 'bell-4', label: '电子提示' },
  { id: 'bell-5', label: '木质风铃' },
] as const
export type SoundId = (typeof SOUND_OPTIONS)[number]['id']

// 应用配置
export interface AppConfig {
  durationMinutes: DurationOption
  soundId: SoundId
  volume: number  // 0.0 - 1.0
}

// 默认配置
export const DEFAULT_CONFIG: AppConfig = {
  durationMinutes: 45,
  soundId: 'bell-1',
  volume: 0.7,
}

// 状态机快照
export interface TimerData {
  state: TimerState
  totalSeconds: number
  remainingSeconds: number
  selectedDuration: DurationOption
  selectedSound: SoundId
}

// Snooze 固定时长(秒) - MVP 硬编码
export const SNOOZE_SECONDS = 300
```

- [ ] **Step 2: 创建 i18n 文件**

创建 `src/i18n/zh-CN.ts`:

```typescript
export const zhCN = {
  appName: 'Your Health',
  idle: {
    notStarted: '未开始',
    settingDuration: '设置: {{minutes}} 分钟',
    start: '开始',
    settings: '⚙ 设置',
  },
  running: {
    remaining: '剩余',
    halfway: '已过半',
    pause: '中断',
    end: '结束',
  },
  paused: {
    paused: '已暂停',
    resume: '继续',
    end: '结束',
  },
  alert: {
    title: '该起来活动啦!',
    subtitle: '你已经坐了 {{minutes}} 分钟,起来走走吧',
    sittingFor: '本次久坐时长',
    snooze: '延后 5 分钟',
    acknowledge: '我知道了',
  },
  settings: {
    title: '设置',
    back: '←',
    duration: '提醒时长',
    sound: '提醒铃声',
    volume: '音量',
    preview: '预览',
    playPreview: '▶ 试听铃声',
  },
} as const

export type Translation = typeof zhCN
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd /d/Git/your-health
npx vue-tsc --noEmit
```

预期:无错误输出。

- [ ] **Step 4: 提交**

```bash
git add src/types/index.ts src/i18n/zh-CN.ts
git commit -m "feat: add core types and zh-CN translations"
```

---

## 任务 4:实现 timerStore 状态机(TDD)

**Files:**
- Create: `vitest.config.ts`
- Create: `src/stores/timerStore.ts`
- Test: `src/stores/timerStore.test.ts`

- [ ] **Step 1: 创建 Vitest 配置**

创建 `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
  },
})
```

- [ ] **Step 2: 创建路径别名**

修改 `tsconfig.json` 的 `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
    // ... 其余配置保留
  }
}
```

- [ ] **Step 3: 写失败的测试 — 状态转换(核心)**

创建 `src/stores/timerStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTimerStore } from './timerStore'
import { DEFAULT_CONFIG, SNOOZE_SECONDS } from '@/types'

describe('timerStore 状态机', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态为 idle', () => {
    const store = useTimerStore()
    expect(store.state).toBe('idle')
    expect(store.remainingSeconds).toBe(0)
  })

  it('start() 从 idle 转到 running,remaining = total', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    expect(store.state).toBe('running')
    expect(store.remainingSeconds).toBe(45 * 60)
    expect(store.totalSeconds).toBe(45 * 60)
  })

  it('pause() 从 running 转到 paused', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    store.pause()
    expect(store.state).toBe('paused')
  })

  it('resume() 从 paused 转到 running,remaining 不变', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    store.tick(60) // 模拟 60 秒过去
    store.pause()
    store.resume()
    expect(store.state).toBe('running')
    expect(store.remainingSeconds).toBe(45 * 60 - 60)
  })

  it('end() 从 running 转到 idle', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    store.end()
    expect(store.state).toBe('idle')
    expect(store.remainingSeconds).toBe(0)
  })

  it('end() 从 paused 转到 idle', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    store.pause()
    store.end()
    expect(store.state).toBe('idle')
  })

  it('tick() 让 remaining 减少 1', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    const before = store.remainingSeconds
    store.tick(1)
    expect(store.remainingSeconds).toBe(before - 1)
  })

  it('tick(N) 让 remaining 减少 N', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    store.tick(60)
    expect(store.remainingSeconds).toBe(45 * 60 - 60)
  })

  it('remaining = 0 时自动转入 alerting', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    store.tick(45 * 60) // 倒计时归零
    expect(store.state).toBe('alerting')
    expect(store.remainingSeconds).toBe(0)
  })

  it('acknowledge() 从 alerting 转到 idle', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    store.tick(45 * 60)
    store.acknowledge()
    expect(store.state).toBe('idle')
  })

  it('snooze() 从 alerting 转到 running,remaining = 300', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    store.tick(45 * 60)
    store.snooze()
    expect(store.state).toBe('running')
    expect(store.remainingSeconds).toBe(SNOOZE_SECONDS)
  })

  it('idle 状态下 pause/resume/end/acknowledge/snooze 不生效', () => {
    const store = useTimerStore()
    store.pause()
    expect(store.state).toBe('idle')
    store.resume()
    expect(store.state).toBe('idle')
    store.end()
    expect(store.state).toBe('idle')
    store.acknowledge()
    expect(store.state).toBe('idle')
    store.snooze()
    expect(store.state).toBe('idle')
  })
})
```

- [ ] **Step 4: 运行测试,确认失败**

```bash
cd /d/Git/your-health
npm test
```

预期:FAIL — `Cannot find module './timerStore'`。

- [ ] **Step 5: 实现 timerStore**

创建 `src/stores/timerStore.ts`:

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  TimerState,
  AppConfig,
  DEFAULT_CONFIG,
  DurationOption,
  SoundId,
  SNOOZE_SECONDS,
} from '@/types'

export const useTimerStore = defineStore('timer', () => {
  const state = ref<TimerState>('idle')
  const totalSeconds = ref(0)
  const remainingSeconds = ref(0)
  const selectedDuration = ref<DurationOption>(DEFAULT_CONFIG.durationMinutes)
  const selectedSound = ref<SoundId>(DEFAULT_CONFIG.soundId)

  const progress = computed(() => {
    if (totalSeconds.value === 0) return 0
    return 1 - remainingSeconds.value / totalSeconds.value
  })

  function applyConfig(config: AppConfig) {
    selectedDuration.value = config.durationMinutes
    selectedSound.value = config.soundId
  }

  function start() {
    if (state.value !== 'idle') return
    totalSeconds.value = selectedDuration.value * 60
    remainingSeconds.value = totalSeconds.value
    state.value = 'running'
  }

  function pause() {
    if (state.value !== 'running') return
    state.value = 'paused'
  }

  function resume() {
    if (state.value !== 'paused') return
    state.value = 'running'
  }

  function end() {
    if (state.value !== 'running' && state.value !== 'paused') return
    state.value = 'idle'
    remainingSeconds.value = 0
    totalSeconds.value = 0
  }

  function tick(elapsedSeconds: number) {
    if (state.value !== 'running') return
    remainingSeconds.value = Math.max(0, remainingSeconds.value - elapsedSeconds)
    if (remainingSeconds.value === 0) {
      state.value = 'alerting'
    }
  }

  function acknowledge() {
    if (state.value !== 'alerting') return
    state.value = 'idle'
    remainingSeconds.value = 0
    totalSeconds.value = 0
  }

  function snooze() {
    if (state.value !== 'alerting') return
    totalSeconds.value = SNOOZE_SECONDS
    remainingSeconds.value = SNOOZE_SECONDS
    state.value = 'running'
  }

  return {
    state,
    totalSeconds,
    remainingSeconds,
    selectedDuration,
    selectedSound,
    progress,
    applyConfig,
    start,
    pause,
    resume,
    end,
    tick,
    acknowledge,
    snooze,
  }
})
```

- [ ] **Step 6: 运行测试,确认全部通过**

```bash
npm test
```

预期:12 个测试全部 PASS。

- [ ] **Step 7: 提交**

```bash
git add src/stores/timerStore.ts src/stores/timerStore.test.ts vitest.config.ts tsconfig.json
git commit -m "feat: timer state machine with full transition coverage"
```

---

## 任务 5:实现 useTimer 倒计时 composable(TDD)

**Files:**
- Create: `src/composables/useTimer.ts`
- Test: `src/composables/useTimer.test.ts`

- [ ] **Step 1: 写失败的测试 — 失焦补偿**

创建 `src/composables/useTimer.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTimerStore } from '@/stores/timerStore'
import { useTimer } from './useTimer'
import { DEFAULT_CONFIG } from '@/types'

describe('useTimer 失焦补偿', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('start() 启动 setInterval 每秒调用 tick', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    const timer = useTimer()
    timer.start()
    expect(store.state).toBe('running')

    vi.advanceTimersByTime(1000)
    expect(store.remainingSeconds).toBe(45 * 60 - 1)

    vi.advanceTimersByTime(2000)
    expect(store.remainingSeconds).toBe(45 * 60 - 3)
  })

  it('pause() 停止 setInterval', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    const timer = useTimer()
    timer.start()
    vi.advanceTimersByTime(3000)
    timer.pause()
    const paused = store.remainingSeconds
    vi.advanceTimersByTime(5000) // 暂停 5 秒
    expect(store.remainingSeconds).toBe(paused)
  })

  it('visibilitychange 补偿丢失的时间', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    const timer = useTimer()
    timer.start()
    vi.advanceTimersByTime(2000)
    const before = store.remainingSeconds

    // 模拟失焦 30 秒(节流期间 setInterval 被合并)
    vi.advanceTimersByTime(30000)

    // 模拟焦点回来,触发 visibilitychange
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(store.remainingSeconds).toBe(before - 30)
  })

  it('end() 停止计时器', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    const timer = useTimer()
    timer.start()
    vi.advanceTimersByTime(2000)
    timer.end()
    const ended = store.remainingSeconds
    vi.advanceTimersByTime(5000)
    expect(store.remainingSeconds).toBe(ended)
  })
})
```

- [ ] **Step 2: 运行测试,确认失败**

```bash
npm test
```

预期:FAIL — `Cannot find module './useTimer'`。

- [ ] **Step 3: 实现 useTimer**

创建 `src/composables/useTimer.ts`:

```typescript
import { onUnmounted } from 'vue'
import { useTimerStore } from '@/stores/timerStore'

export function useTimer() {
  const store = useTimerStore()
  let intervalId: number | null = null
  let lastTickAt = Date.now()

  function doTick() {
    const now = Date.now()
    const elapsed = Math.floor((now - lastTickAt) / 1000)
    if (elapsed > 0) {
      store.tick(elapsed)
      lastTickAt = now
    }
  }

  function start() {
    if (intervalId !== null) return
    store.start()
    lastTickAt = Date.now()
    intervalId = window.setInterval(doTick, 1000)
  }

  function pause() {
    if (intervalId === null) return
    window.clearInterval(intervalId)
    intervalId = null
    store.pause()
  }

  function resume() {
    if (intervalId !== null) return
    store.resume()
    lastTickAt = Date.now()
    intervalId = window.setInterval(doTick, 1000)
  }

  function end() {
    if (intervalId !== null) {
      window.clearInterval(intervalId)
      intervalId = null
    }
    store.end()
  }

  function onVisibilityChange() {
    if (!document.hidden && intervalId !== null) {
      doTick() // 补偿
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    if (intervalId !== null) window.clearInterval(intervalId)
  })

  return { start, pause, resume, end }
}
```

- [ ] **Step 4: 运行测试,确认通过**

```bash
npm test
```

预期:4 个 useTimer 测试全部 PASS(加上之前的 12 个状态机测试)。

- [ ] **Step 5: 提交**

```bash
git add src/composables/useTimer.ts src/composables/useTimer.test.ts
git commit -m "feat: useTimer composable with visibility compensation"
```

---

## 任务 6:ProgressRing 圆环组件(TDD)

**Files:**
- Create: `src/components/ProgressRing.vue`
- Test: `src/components/ProgressRing.test.ts`

- [ ] **Step 1: 写失败的测试**

创建 `src/components/ProgressRing.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressRing from './ProgressRing.vue'

describe('ProgressRing', () => {
  it('渲染 SVG 元素', () => {
    const wrapper = mount(ProgressRing, {
      props: { progress: 0.5, size: 200 },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('progress = 0 时,描边偏移为周长', () => {
    const wrapper = mount(ProgressRing, {
      props: { progress: 0, size: 200 },
    })
    const circle = wrapper.find('circle.progress')
    // 周长 = 2 * π * 86 ≈ 540
    expect(circle.attributes('stroke-dashoffset')).toBe('540')
  })

  it('progress = 1 时,描边偏移为 0', () => {
    const wrapper = mount(ProgressRing, {
      props: { progress: 1, size: 200 },
    })
    const circle = wrapper.find('circle.progress')
    expect(circle.attributes('stroke-dashoffset')).toBe('0')
  })

  it('progress = 0.5 时,描边偏移为半周长', () => {
    const wrapper = mount(ProgressRing, {
      props: { progress: 0.5, size: 200 },
    })
    const circle = wrapper.find('circle.progress')
    expect(circle.attributes('stroke-dashoffset')).toBe('270')
  })

  it('支持 dashed prop(paused 状态)', () => {
    const wrapper = mount(ProgressRing, {
      props: { progress: 0.5, size: 200, dashed: true },
    })
    const circle = wrapper.find('circle.progress')
    expect(circle.attributes('stroke-dasharray')).toBe('2 6')
  })
})
```

- [ ] **Step 2: 运行测试,确认失败**

```bash
npm test
```

预期:FAIL — `Cannot find module './ProgressRing.vue'`。

- [ ] **Step 3: 实现 ProgressRing**

创建 `src/components/ProgressRing.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    progress: number  // 0 - 1
    size?: number
    strokeWidth?: number
    color?: string
    bgColor?: string
    dashed?: boolean
  }>(),
  {
    size: 200,
    strokeWidth: 12,
    color: '#16a34a',
    bgColor: '#bbf7d0',
    dashed: false,
  }
)

const radius = computed(() => (props.size - props.strokeWidth) / 2 - 4)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - props.progress))
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 200 200"
    :style="{ transform: 'rotate(-90deg)' }"
  >
    <circle
      cx="100"
      cy="100"
      :r="radius"
      fill="none"
      :stroke="bgColor"
      :stroke-width="strokeWidth"
    />
    <circle
      class="progress"
      cx="100"
      cy="100"
      :r="radius"
      fill="none"
      :stroke="color"
      :stroke-width="strokeWidth"
      :stroke-dasharray="dashed ? '2 6' : circumference"
      :stroke-dashoffset="dashOffset"
      stroke-linecap="round"
    />
  </svg>
</template>
```

- [ ] **Step 4: 运行测试,确认通过**

```bash
npm test
```

预期:ProgressRing 的 5 个测试全部 PASS。

- [ ] **Step 5: 提交**

```bash
git add src/components/ProgressRing.vue src/components/ProgressRing.test.ts
git commit -m "feat: ProgressRing SVG component"
```

---

## 任务 7:CountdownText 倒计时组件(TDD)

**Files:**
- Create: `src/components/CountdownText.vue`
- Test: `src/components/CountdownText.test.ts`

- [ ] **Step 1: 写失败的测试**

创建 `src/components/CountdownText.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CountdownText from './CountdownText.vue'

describe('CountdownText', () => {
  it('把 0 秒格式化为 00:00', () => {
    const wrapper = mount(CountdownText, {
      props: { seconds: 0 },
    })
    expect(wrapper.text()).toBe('00:00')
  })

  it('把 59 秒格式化为 00:59', () => {
    const wrapper = mount(CountdownText, {
      props: { seconds: 59 },
    })
    expect(wrapper.text()).toBe('00:59')
  })

  it('把 60 秒格式化为 01:00', () => {
    const wrapper = mount(CountdownText, {
      props: { seconds: 60 },
    })
    expect(wrapper.text()).toBe('01:00')
  })

  it('把 2700 秒格式化为 45:00', () => {
    const wrapper = mount(CountdownText, {
      props: { seconds: 2700 },
    })
    expect(wrapper.text()).toBe('45:00')
  })

  it('把 3599 秒格式化为 59:59', () => {
    const wrapper = mount(CountdownText, {
      props: { seconds: 3599 },
    })
    expect(wrapper.text()).toBe('59:59')
  })

  it('支持 size prop', () => {
    const wrapper = mount(CountdownText, {
      props: { seconds: 60, size: 48 },
    })
    expect(wrapper.find('div').attributes('style')).toContain('font-size: 48px')
  })
})
```

- [ ] **Step 2: 运行测试,确认失败**

```bash
npm test
```

预期:FAIL — `Cannot find module './CountdownText.vue'`。

- [ ] **Step 3: 实现 CountdownText**

创建 `src/components/CountdownText.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    seconds: number
    size?: number
    color?: string
    fontFamily?: 'mono' | 'sans'
  }>(),
  {
    size: 38,
    color: '#14532d',
    fontFamily: 'mono',
  }
)

const formatted = computed(() => {
  const m = Math.floor(props.seconds / 60)
  const s = props.seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
</script>

<template>
  <div
    :style="{
      fontSize: `${size}px`,
      fontWeight: 600,
      color,
      fontFamily: fontFamily === 'mono' ? 'monospace' : 'inherit',
    }"
  >
    {{ formatted }}
  </div>
</template>
```

- [ ] **Step 4: 运行测试,确认通过**

```bash
npm test
```

预期:CountdownText 的 6 个测试全部 PASS。

- [ ] **Step 5: 提交**

```bash
git add src/components/CountdownText.vue src/components/CountdownText.test.ts
git commit -m "feat: CountdownText MM:SS formatter component"
```

---

## 任务 8:PillButton 胶囊按钮组件(TDD)

**Files:**
- Create: `src/components/PillButton.vue`
- Test: `src/components/PillButton.test.ts`

- [ ] **Step 1: 写失败的测试**

创建 `src/components/PillButton.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PillButton from './PillButton.vue'

describe('PillButton', () => {
  it('渲染 slot 内容', () => {
    const wrapper = mount(PillButton, {
      slots: { default: '点击我' },
    })
    expect(wrapper.text()).toBe('点击我')
  })

  it('渲染为 button 元素', () => {
    const wrapper = mount(PillButton, {
      slots: { default: 'OK' },
    })
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('primary variant 应用实心样式', () => {
    const wrapper = mount(PillButton, {
      props: { variant: 'primary' },
      slots: { default: 'X' },
    })
    expect(wrapper.element.style.borderRadius).toBe('24px')
    expect(wrapper.element.style.background).toBeTruthy()
  })

  it('secondary variant 应用描边样式', () => {
    const wrapper = mount(PillButton, {
      props: { variant: 'secondary' },
      slots: { default: 'X' },
    })
    expect(wrapper.element.style.borderRadius).toBe('24px')
    expect(wrapper.element.style.background).toBeTruthy()
  })

  it('点击触发 click 事件', async () => {
    const wrapper = mount(PillButton, {
      slots: { default: 'X' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('disabled prop 阻止点击', async () => {
    const wrapper = mount(PillButton, {
      props: { disabled: true },
      slots: { default: 'X' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
```

- [ ] **Step 2: 运行测试,确认失败**

```bash
npm test
```

预期:FAIL — `Cannot find module './PillButton.vue'`。

- [ ] **Step 3: 实现 PillButton**

创建 `src/components/PillButton.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    disabled: false,
    type: 'button',
  }
)

defineEmits<{
  click: [event: MouseEvent]
}>()

const style = computed(() => {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 28px', fontSize: '15px' },
    lg: { padding: '14px 36px', fontSize: '16px' },
  }
  const variants = {
    primary: {
      border: 'none',
      background: '#16a34a',
      color: 'white',
      boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
    },
    secondary: {
      border: '1px solid rgba(22,163,74,0.2)',
      background: 'white',
      color: '#15803d',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    ghost: {
      border: 'none',
      background: 'transparent',
      color: '#15803d',
      boxShadow: 'none',
    },
  }
  return {
    ...sizes[props.size],
    ...variants[props.variant],
    borderRadius: '24px',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.5 : 1,
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :style="style"
    @click="(e) => !disabled && $emit('click', e)"
  >
    <slot />
  </button>
</template>
```

- [ ] **Step 4: 运行测试,确认通过**

```bash
npm test
```

预期:PillButton 的 6 个测试全部 PASS。

- [ ] **Step 5: 提交**

```bash
git add src/components/PillButton.vue src/components/PillButton.test.ts
git commit -m "feat: PillButton capsule button component"
```

---

## 任务 9:主题 CSS — 治愈绿 + 胶囊

**Files:**
- Create: `src/assets/styles/theme.css`, `src/assets/styles/main.css`

- [ ] **Step 1: 创建主题变量文件**

创建 `src/assets/styles/theme.css`:

```css
:root {
  /* 治愈绿主题(B 风格) */
  --color-bg-gradient-start: #f0fdf4;
  --color-bg-gradient-end: #dcfce7;

  --color-primary: #16a34a;        /* green-600 */
  --color-primary-hover: #15803d;  /* green-700 */
  --color-primary-dark: #14532d;   /* green-900 */

  --color-accent: #15803d;
  --color-muted: #bbf7d0;          /* green-200 */
  --color-faint: #86efac;          /* green-300 */

  --color-text-strong: #14532d;
  --color-text: #15803d;
  --color-text-muted: #16a34a;

  /* 圆角(D 风格胶囊) */
  --radius-pill: 24px;
  --radius-md: 8px;

  /* 阴影 */
  --shadow-primary: 0 2px 6px rgba(22, 163, 74, 0.3);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

- [ ] **Step 2: 创建全局样式**

创建 `src/assets/styles/main.css`:

```css
@import './theme.css';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  height: 100%;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: var(--color-text-strong);
}

#app {
  background: linear-gradient(
    180deg,
    var(--color-bg-gradient-start) 0%,
    var(--color-bg-gradient-end) 100%
  );
  min-height: 100vh;
}
```

- [ ] **Step 3: 在 main.ts 中引入样式**

修改 `src/main.ts`:

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

- [ ] **Step 4: 验证**

```bash
cd /d/Git/your-health
npx vue-tsc --noEmit
```

预期:无错误。

- [ ] **Step 5: 提交**

```bash
git add src/assets/styles/theme.css src/assets/styles/main.css src/main.ts
git commit -m "feat: theme CSS (治愈绿 + capsule buttons)"
```

---

## 任务 10:设置 vue-router

**Files:**
- Create: `src/router/index.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: 创建路由配置**

创建 `src/router/index.ts`:

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/alert',
      name: 'alert',
      component: () => import('@/views/AlertView.vue'),
    },
  ],
})

export default router
```

- [ ] **Step 2: 修改 main.ts 接入 router**

修改 `src/main.ts`:

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

- [ ] **Step 3: 验证编译**

```bash
cd /d/Git/your-health
npx vue-tsc --noEmit
```

预期:无错误(此时 views 还不存在,但 `() => import(...)` 是动态的,不会立即报错)。

- [ ] **Step 4: 提交**

```bash
git add src/router/index.ts src/main.ts
git commit -m "feat: vue-router setup with home/settings/alert routes"
```

---

## 任务 11:HomeView 主页

**Files:**
- Create: `src/views/HomeView.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: 实现 HomeView(三种状态)**

创建 `src/views/HomeView.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTimerStore } from '@/stores/timerStore'
import { useTimer } from '@/composables/useTimer'
import ProgressRing from '@/components/ProgressRing.vue'
import CountdownText from '@/components/CountdownText.vue'
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const router = useRouter()
const store = useTimerStore()
const timer = useTimer()

const halfway = computed(() => store.progress >= 0.5)

function onStart() {
  timer.start()
}

function onPause() {
  timer.pause()
}

function onResume() {
  timer.resume()
}

function onEnd() {
  timer.end()
}

function goSettings() {
  router.push('/settings')
}
</script>

<template>
  <main class="home">
    <!-- idle -->
    <template v-if="store.state === 'idle'">
      <div class="ring-wrap">
        <ProgressRing :progress="0" :size="200" />
        <div class="center">
          <div class="not-started">{{ zhCN.idle.notStarted }}</div>
          <div class="setting-info">
            {{ zhCN.idle.settingDuration.replace('{{minutes}}', String(store.selectedDuration)) }}
          </div>
        </div>
      </div>
      <PillButton variant="primary" size="lg" @click="onStart">
        {{ zhCN.idle.start }}
      </PillButton>
      <button class="settings-link" @click="goSettings">{{ zhCN.idle.settings }}</button>
    </template>

    <!-- running -->
    <template v-else-if="store.state === 'running'">
      <div class="ring-wrap">
        <ProgressRing :progress="store.progress" :size="200" />
        <div class="center">
          <CountdownText :seconds="store.remainingSeconds" />
          <div class="hint">
            {{ halfway ? zhCN.running.halfway : zhCN.running.remaining }}
          </div>
        </div>
      </div>
      <div class="actions">
        <PillButton variant="secondary" @click="onPause">
          {{ zhCN.running.pause }}
        </PillButton>
        <PillButton variant="secondary" @click="onEnd">
          {{ zhCN.running.end }}
        </PillButton>
      </div>
    </template>

    <!-- paused -->
    <template v-else-if="store.state === 'paused'">
      <div class="ring-wrap">
        <ProgressRing
          :progress="store.progress"
          :size="200"
          :color="'#86efac'"
          dashed
        />
        <div class="center">
          <CountdownText :seconds="store.remainingSeconds" color="#15803d" />
          <div class="hint">{{ zhCN.paused.paused }}</div>
        </div>
      </div>
      <div class="actions">
        <PillButton variant="primary" @click="onResume">
          {{ zhCN.paused.resume }}
        </PillButton>
        <PillButton variant="secondary" @click="onEnd">
          {{ zhCN.paused.end }}
        </PillButton>
      </div>
    </template>

    <!-- alerting 不在此页处理 -->
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px 24px;
  gap: 24px;
}

.ring-wrap {
  position: relative;
  width: 200px;
  height: 200px;
}

.center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.not-started {
  font-size: 18px;
  color: var(--color-primary);
  font-weight: 500;
}

.setting-info {
  font-size: 13px;
  color: var(--color-primary);
  margin-top: 4px;
}

.hint {
  font-size: 12px;
  color: var(--color-text);
  margin-top: 4px;
}

.actions {
  display: flex;
  gap: 12px;
}

.settings-link {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 14px;
  cursor: pointer;
}
</style>
```

- [ ] **Step 2: 修改 App.vue**

修改 `src/App.vue`:

```vue
<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
```

- [ ] **Step 3: 验证编译**

```bash
cd /d/Git/your-health
npx vue-tsc --noEmit
```

预期:无错误。

- [ ] **Step 4: 提交**

```bash
git add src/views/HomeView.vue src/App.vue
git commit -m "feat: HomeView with idle/running/paused states"
```

---

## 任务 12:SettingsView 设置页

**Files:**
- Create: `src/views/SettingsView.vue`

- [ ] **Step 1: 实现 SettingsView**

创建 `src/views/SettingsView.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTimerStore } from '@/stores/timerStore'
import {
  DURATION_OPTIONS,
  SOUND_OPTIONS,
  DurationOption,
  SoundId,
  DEFAULT_CONFIG,
} from '@/types'
import { useConfig } from '@/composables/useConfig'
import { useAudio } from '@/composables/useAudio'
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const router = useRouter()
const store = useTimerStore()
const { load, save } = useConfig()
const { play: playPreview, stop: stopPreview } = useAudio()

const duration = ref<DurationOption>(DEFAULT_CONFIG.durationMinutes)
const sound = ref<SoundId>(DEFAULT_CONFIG.soundId)
const volume = ref(DEFAULT_CONFIG.volume)
const loaded = ref(false)

onMounted(async () => {
  const config = await load()
  duration.value = config.durationMinutes
  sound.value = config.soundId
  volume.value = config.volume
  store.applyConfig(config)
  loaded.value = true
})

async function onDurationChange(e: Event) {
  const v = Number((e.target as HTMLSelectElement).value) as DurationOption
  duration.value = v
  await persist()
}

async function onSoundChange(e: Event) {
  sound.value = (e.target as HTMLSelectElement).value as SoundId
  await persist()
}

async function onVolumeChange(e: Event) {
  const v = Number((e.target as HTMLInputElement).value) / 100
  volume.value = v
  await persist()
}

async function persist() {
  await save({ durationMinutes: duration.value, soundId: sound.value, volume: volume.value })
  store.applyConfig({
    durationMinutes: duration.value,
    soundId: sound.value,
    volume: volume.value,
  })
}

function previewSound() {
  stopPreview()
  playPreview(sound.value, volume.value)
}

function goBack() {
  stopPreview()
  router.push('/')
}

const version = 'v0.1.0'
</script>

<template>
  <div class="settings" v-if="loaded">
    <header>
      <span class="back" @click="goBack">{{ zhCN.settings.back }}</span>
      <span class="title">{{ zhCN.settings.title }}</span>
    </header>

    <section class="group-label">{{ zhCN.settings.duration }}</section>
    <div class="row">
      <span>{{ zhCN.settings.duration }}</span>
      <select :value="duration" @change="onDurationChange">
        <option v-for="d in DURATION_OPTIONS" :key="d" :value="d">
          {{ d }} 分钟
        </option>
      </select>
    </div>

    <section class="group-label">{{ zhCN.settings.sound }}</section>
    <div class="row">
      <span>{{ zhCN.settings.sound }}</span>
      <select :value="sound" @change="onSoundChange">
        <option v-for="s in SOUND_OPTIONS" :key="s.id" :value="s.id">
          {{ s.label }}
        </option>
      </select>
    </div>

    <div class="row volume-row">
      <div class="volume-header">
        <span>{{ zhCN.settings.volume }}</span>
        <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        :value="Math.round(volume * 100)"
        @input="onVolumeChange"
      />
    </div>

    <section class="group-label">{{ zhCN.settings.preview }}</section>
    <div class="row center">
      <PillButton variant="primary" @click="previewSound">
        {{ zhCN.settings.playPreview }}
      </PillButton>
    </div>

    <footer>{{ version }}</footer>
  </div>
</template>

<style scoped>
.settings {
  max-width: 480px;
  margin: 0 auto;
  padding-bottom: 32px;
}

header {
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-muted);
  display: flex;
  align-items: center;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back {
  color: var(--color-primary);
  font-size: 18px;
  cursor: pointer;
  user-select: none;
}

.title {
  color: var(--color-text-strong);
  font-size: 16px;
  font-weight: 500;
}

.group-label {
  padding: 8px 20px;
  font-size: 12px;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(240, 253, 244, 0.5);
}

.row {
  background: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(240, 253, 244, 0.5);
  color: var(--color-text-strong);
}

.row.center {
  justify-content: center;
}

.volume-row {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.volume-header {
  display: flex;
  justify-content: space-between;
}

.volume-value {
  color: var(--color-primary);
}

select {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-muted);
  color: var(--color-primary);
  background: white;
  font-size: 14px;
  cursor: pointer;
}

input[type='range'] {
  width: 100%;
  accent-color: var(--color-primary);
}

footer {
  padding: 20px;
  text-align: center;
  color: var(--color-faint);
  font-size: 12px;
}
</style>
```

- [ ] **Step 2: 验证编译**

```bash
cd /d/Git/your-health
npx vue-tsc --noEmit
```

预期:报错 `Cannot find module '@/composables/useConfig'` 和 `@/composables/useAudio`。这是预期的(后续任务实现)。

- [ ] **Step 3: 提交**

```bash
git add src/views/SettingsView.vue
git commit -m "feat: SettingsView with duration/sound/volume controls"
```

---

## 任务 13:AlertView 提醒弹窗

**Files:**
- Create: `src/views/AlertView.vue`

- [ ] **Step 1: 实现 AlertView**

创建 `src/views/AlertView.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import { useAudio } from '@/composables/useAudio'
import { useConfig } from '@/composables/useConfig'
import { closeAlertWindow } from '@/lib/tauri'
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const store = useTimerStore()
const { play, stop } = useAudio()
const { load } = useConfig()

const sittingSeconds = ref(store.totalSeconds)
let intervalId: number | null = null

onMounted(async () => {
  const config = await load()
  play(store.selectedSound, config.volume)
  intervalId = window.setInterval(() => {
    sittingSeconds.value += 1
  }, 1000)
})

onUnmounted(() => {
  if (intervalId !== null) window.clearInterval(intervalId)
  stop()
})

async function onAcknowledge() {
  store.acknowledge()
  await closeAlertWindow()
}

async function onSnooze() {
  store.snooze()
  await closeAlertWindow()
}
</script>

<template>
  <div class="alert">
    <div class="icon">🚶</div>
    <h1>{{ zhCN.alert.title }}</h1>
    <p class="subtitle">
      {{ zhCN.alert.subtitle.replace('{{minutes}}', String(Math.floor(sittingSeconds / 60))) }}
    </p>
    <div class="time">{{ String(Math.floor(sittingSeconds / 60)).padStart(2, '0') }}:{{ String(sittingSeconds % 60).padStart(2, '0') }}</div>
    <div class="hint">{{ zhCN.alert.sittingFor }}</div>
    <div class="actions">
      <PillButton variant="ghost-white" size="lg" @click="onSnooze">
        {{ zhCN.alert.snooze }}
      </PillButton>
      <PillButton variant="solid-white" size="lg" @click="onAcknowledge">
        {{ zhCN.alert.acknowledge }}
      </PillButton>
    </div>
  </div>
</template>

<style scoped>
.alert {
  background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.icon {
  font-size: 80px;
  margin-bottom: 16px;
}

h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 40px;
}

.time {
  font-size: 60px;
  font-weight: 600;
  font-family: monospace;
  margin-bottom: 8px;
}

.hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 48px;
}

.actions {
  display: flex;
  gap: 12px;
}
</style>
```

- [ ] **Step 2: 验证编译(会有错误,后续任务修)**

```bash
cd /d/Git/your-health
npx vue-tsc --noEmit
```

预期:多个模块未找到错误(预期,后续任务补)。先继续。

- [ ] **Step 3: 提交**

```bash
git add src/views/AlertView.vue
git commit -m "feat: AlertView fullscreen reminder dialog"
```

---

## 任务 14:Tauri 命令(配置 + 窗口)

**Files:**
- Create: `src-tauri/src/lib.rs`, `src-tauri/src/commands/mod.rs`, `src-tauri/src/commands/config.rs`, `src-tauri/src/commands/window.rs`
- Modify: `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/src/main.rs`, `src-tauri/capabilities/default.json`

- [ ] **Step 1: 添加 tauri-plugin-store 到 Cargo.toml**

修改 `src-tauri/Cargo.toml`,在 `[dependencies]` 下添加:

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

- [ ] **Step 2: 实现配置读写命令**

创建 `src-tauri/src/commands/config.rs`:

```rust
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub duration_minutes: u32,
    pub sound_id: String,
    pub volume: f32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            duration_minutes: 45,
            sound_id: "bell-1".to_string(),
            volume: 0.7,
        }
    }
}

#[tauri::command]
pub fn load_config(app: AppHandle) -> Result<AppConfig, String> {
    let store = app.store("config.json").map_err(|e| e.to_string())?;
    let duration = store
        .get("durationMinutes")
        .and_then(|v| v.as_u64())
        .map(|v| v as u32)
        .unwrap_or(45);
    let sound_id = store
        .get("soundId")
        .and_then(|v| v.as_str())
        .unwrap_or("bell-1")
        .to_string();
    let volume = store
        .get("volume")
        .and_then(|v| v.as_f64())
        .map(|v| v as f32)
        .unwrap_or(0.7);

    // 校验 duration 在合法范围内
    let duration_minutes = match duration {
        30 | 45 | 60 | 90 => duration,
        _ => 45,
    };

    Ok(AppConfig {
        duration_minutes,
        sound_id,
        volume,
    })
}

#[tauri::command]
pub fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    let store = app.store("config.json").map_err(|e| e.to_string())?;
    store.set("durationMinutes", serde_json::json!(config.duration_minutes));
    store.set("soundId", serde_json::json!(config.sound_id));
    store.set("volume", serde_json::json!(config.volume));
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_config() {
        let c = AppConfig::default();
        assert_eq!(c.duration_minutes, 45);
        assert_eq!(c.sound_id, "bell-1");
        assert!((c.volume - 0.7).abs() < 0.001);
    }
}
```

- [ ] **Step 3: 实现窗口管理命令**

创建 `src-tauri/src/commands/window.rs`:

```rust
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub async fn open_alert_window(app: AppHandle) -> Result<(), String> {
    if app.get_webview_window("alert").is_some() {
        return Ok(());
    }
    WebviewWindowBuilder::new(&app, "alert", WebviewUrl::App("index.html#/alert".into()))
        .title("")
        .inner_size(600.0, 480.0)
        .decorations(false)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
        .build()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn close_alert_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("alert") {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

- [ ] **Step 4: 创建 commands/mod.rs**

创建 `src-tauri/src/commands/mod.rs`:

```rust
pub mod config;
pub mod window;
```

- [ ] **Step 5: 修改 lib.rs**

修改 `src-tauri/src/lib.rs`:

```rust
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::config::load_config,
            commands::config::save_config,
            commands::window::open_alert_window,
            commands::window::close_alert_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 6: 修改 main.rs**

修改 `src-tauri/src/main.rs`:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    your_health_lib::run()
}
```

- [ ] **Step 7: 更新 capabilities**

修改 `src-tauri/capabilities/default.json`,确保 stores 插件权限存在:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "default capabilities",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "store:default"
  ]
}
```

- [ ] **Step 8: 运行 Rust 测试**

```bash
cd /d/Git/your-health/src-tauri
cargo test
```

预期:`default_config` 测试 PASS。

- [ ] **Step 9: 提交**

```bash
git add src-tauri/src/ src-tauri/Cargo.toml src-tauri/capabilities/
git commit -m "feat: Tauri commands for config and alert window"
```

---

## 任务 15:useConfig composable(TDD)

**Files:**
- Create: `src/composables/useConfig.ts`, `src/lib/tauri.ts`
- Test: `src/composables/useConfig.test.ts`

- [ ] **Step 1: 创建 Tauri 调用封装**

创建 `src/lib/tauri.ts`:

```typescript
import { invoke } from '@tauri-apps/api/core'
import type { AppConfig, DurationOption, SoundId } from '@/types'

interface RustAppConfig {
  duration_minutes: number
  sound_id: string
  volume: number
}

function toAppConfig(rust: RustAppConfig): AppConfig {
  return {
    durationMinutes: rust.duration_minutes as DurationOption,
    soundId: rust.sound_id as SoundId,
    volume: rust.volume,
  }
}

export async function loadConfig(): Promise<AppConfig> {
  const rust = await invoke<RustAppConfig>('load_config')
  return toAppConfig(rust)
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await invoke('save_config', {
    config: {
      duration_minutes: config.durationMinutes,
      sound_id: config.soundId,
      volume: config.volume,
    },
  })
}

export async function openAlertWindow(): Promise<void> {
  await invoke('open_alert_window')
}

export async function closeAlertWindow(): Promise<void> {
  await invoke('close_alert_window')
}
```

- [ ] **Step 2: 写失败的测试**

创建 `src/composables/useConfig.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useConfig } from './useConfig'

vi.mock('@/lib/tauri', () => ({
  loadConfig: vi.fn(),
  saveConfig: vi.fn(),
}))

import { loadConfig, saveConfig } from '@/lib/tauri'
import { DEFAULT_CONFIG } from '@/types'

describe('useConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('load() 在 Tauri 失败时返回默认配置', async () => {
    vi.mocked(loadConfig).mockRejectedValue(new Error('not in tauri'))
    const { load } = useConfig()
    const config = await load()
    expect(config).toEqual(DEFAULT_CONFIG)
  })

  it('load() 在成功时返回解析后的配置', async () => {
    vi.mocked(loadConfig).mockResolvedValue({
      durationMinutes: 60,
      soundId: 'bell-2',
      volume: 0.5,
    })
    const { load } = useConfig()
    const config = await load()
    expect(config).toEqual({
      durationMinutes: 60,
      soundId: 'bell-2',
      volume: 0.5,
    })
  })

  it('save() 调用底层 saveConfig', async () => {
    vi.mocked(saveConfig).mockResolvedValue(undefined)
    const { save } = useConfig()
    await save({ durationMinutes: 30, soundId: 'bell-1', volume: 0.8 })
    expect(saveConfig).toHaveBeenCalledWith({
      durationMinutes: 30,
      soundId: 'bell-1',
      volume: 0.8,
    })
  })
})
```

- [ ] **Step 3: 运行测试,确认失败**

```bash
cd /d/Git/your-health
npm test
```

预期:FAIL — `Cannot find module './useConfig'`。

- [ ] **Step 4: 实现 useConfig**

创建 `src/composables/useConfig.ts`:

```typescript
import type { AppConfig } from '@/types'
import { DEFAULT_CONFIG } from '@/types'
import { loadConfig, saveConfig as tauriSaveConfig } from '@/lib/tauri'

export function useConfig() {
  async function load(): Promise<AppConfig> {
    try {
      return await loadConfig()
    } catch (err) {
      console.warn('loadConfig failed, using defaults:', err)
      return DEFAULT_CONFIG
    }
  }

  async function save(config: AppConfig): Promise<void> {
    try {
      await tauriSaveConfig(config)
    } catch (err) {
      console.error('saveConfig failed:', err)
      throw err
    }
  }

  return { load, save }
}
```

- [ ] **Step 5: 运行测试,确认通过**

```bash
npm test
```

预期:3 个 useConfig 测试 PASS(加上之前所有测试)。

- [ ] **Step 6: 提交**

```bash
git add src/lib/tauri.ts src/composables/useConfig.ts src/composables/useConfig.test.ts
git commit -m "feat: useConfig composable with default fallback"
```

---

## 任务 16:useAudio composable(TDD)

**Files:**
- Create: `src/composables/useAudio.ts`
- Test: `src/composables/useAudio.test.ts`

- [ ] **Step 1: 写失败的测试**

创建 `src/composables/useAudio.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAudio } from './useAudio'

const mockAudioInstances: any[] = []

class MockAudio {
  src = ''
  volume = 1
  loop = false
  paused = true
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn(function (this: any) {
    this.paused = true
  })
  constructor(src: string) {
    this.src = src
    mockAudioInstances.push(this)
  }
}

beforeEach(() => {
  mockAudioInstances.length = 0
  ;(globalThis as any).Audio = MockAudio
  vi.mock('@tauri-apps/api/core', () => ({
    convertFileSrc: (path: string) => `tauri://localhost/${path}`,
  }))
})

describe('useAudio', () => {
  it('play() 创建 Audio 并设置 loop', async () => {
    const { play } = useAudio()
    await play('bell-1', 0.5)
    expect(mockAudioInstances).toHaveLength(1)
    expect(mockAudioInstances[0].src).toBe('tauri://localhost/assets/sounds/bell-1.wav')
    expect(mockAudioInstances[0].loop).toBe(true)
    expect(mockAudioInstances[0].volume).toBe(0.5)
    expect(mockAudioInstances[0].play).toHaveBeenCalled()
  })

  it('stop() 暂停当前 audio', async () => {
    const { play, stop } = useAudio()
    await play('bell-1', 0.5)
    const audio = mockAudioInstances[0]
    stop()
    expect(audio.pause).toHaveBeenCalled()
  })

  it('stop() 在没有 audio 时不报错', () => {
    const { stop } = useAudio()
    expect(() => stop()).not.toThrow()
  })

  it('play() 后再 play() 会先 stop 旧的', async () => {
    const { play } = useAudio()
    await play('bell-1', 0.5)
    const first = mockAudioInstances[0]
    await play('bell-2', 0.5)
    expect(first.pause).toHaveBeenCalled()
    expect(mockAudioInstances).toHaveLength(2)
  })
})
```

- [ ] **Step 2: 运行测试,确认失败**

```bash
npm test
```

预期:FAIL — `Cannot find module './useAudio'`。

- [ ] **Step 3: 实现 useAudio**

创建 `src/composables/useAudio.ts`:

```typescript
import { ref } from 'vue'
import { convertFileSrc } from '@tauri-apps/api/core'

export function useAudio() {
  const audioRef = ref<HTMLAudioElement | null>(null)

  async function play(soundId: string, volume: number) {
    stop()
    const url = convertFileSrc(`assets/sounds/${soundId}.wav`)
    const audio = new Audio(url)
    audio.volume = volume
    audio.loop = true
    audioRef.value = audio
    try {
      await audio.play()
    } catch (err) {
      console.warn('Audio play failed:', err)
    }
  }

  function stop() {
    if (audioRef.value) {
      audioRef.value.pause()
      audioRef.value = null
    }
  }

  return { play, stop }
}
```

- [ ] **Step 4: 运行测试,确认通过**

```bash
npm test
```

预期:4 个 useAudio 测试 PASS(加上之前所有测试)。

- [ ] **Step 5: 提交**

```bash
git add src/composables/useAudio.ts src/composables/useAudio.test.ts
git commit -m "feat: useAudio composable with looping playback"
```

---

## 任务 17:连接 alerting 流程(状态机 → 窗口 → 音频)

**Files:**
- Modify: `src/composables/useTimer.ts`
- Create: `src/composables/useAlerting.ts`

- [ ] **Step 1: 创建 alerting 协调器**

创建 `src/composables/useAlerting.ts`:

```typescript
import { watch } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import { openAlertWindow } from '@/lib/tauri'

export function useAlerting() {
  const store = useTimerStore()

  watch(
    () => store.state,
    async (newState, oldState) => {
      if (newState === 'alerting' && oldState === 'running') {
        try {
          await openAlertWindow()
        } catch (err) {
          console.error('Failed to open alert window:', err)
        }
      }
    }
  )
}
```

- [ ] **Step 2: 在 HomeView 接入 alerting 协调器**

修改 `src/views/HomeView.vue`,在 `<script setup>` 中添加:

```typescript
import { useAlerting } from '@/composables/useAlerting'
useAlerting()
```

完整修改后的 `<script setup>` 块:

```typescript
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTimerStore } from '@/stores/timerStore'
import { useTimer } from '@/composables/useTimer'
import { useAlerting } from '@/composables/useAlerting'
import ProgressRing from '@/components/ProgressRing.vue'
import CountdownText from '@/components/CountdownText.vue'
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const router = useRouter()
const store = useTimerStore()
const timer = useTimer()
useAlerting()

const halfway = computed(() => store.progress >= 0.5)

function onStart() {
  timer.start()
}

function onPause() {
  timer.pause()
}

function onResume() {
  timer.resume()
}

function onEnd() {
  timer.end()
}

function goSettings() {
  router.push('/settings')
}
</script>
```

- [ ] **Step 3: 验证编译**

```bash
cd /d/Git/your-health
npx vue-tsc --noEmit
```

预期:无错误。

- [ ] **Step 4: 提交**

```bash
git add src/composables/useAlerting.ts src/views/HomeView.vue
git commit -m "feat: alerting flow — watch state transition to open alert window"
```

---

## 任务 18:添加 5 个内置铃声占位文件

**Files:**
- Create: `src/assets/sounds/bell-1.wav` 到 `bell-5.wav`
- Create: `scripts/setup-sounds.mjs`

- [ ] **Step 1: 创建铃声下载脚本**

创建 `scripts/setup-sounds.mjs`:

```javascript
// 占位脚本: MVP 阶段使用生成的 WAV 文件
// 真实铃声应在后续替换为从 Freesound 下载的音频
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const soundsDir = join(__dirname, '..', 'src', 'assets', 'sounds')
mkdirSync(soundsDir, { recursive: true })

// 生成 5 个不同的简短 WAV (440Hz 不同长度的正弦波)
const sampleRate = 22050
const durations = [0.3, 0.4, 0.5, 0.25, 0.6]
const frequencies = [880, 660, 1320, 440, 990]

for (let i = 0; i < 5; i++) {
  const duration = durations[i]
  const freq = frequencies[i]
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = Buffer.alloc(44 + numSamples * 2)

  // WAV header
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + numSamples * 2, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // PCM chunk size
  buffer.writeUInt16LE(1, 20) // format = PCM
  buffer.writeUInt16LE(1, 22) // channels = mono
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28) // byte rate
  buffer.writeUInt16LE(2, 32) // block align
  buffer.writeUInt16LE(16, 34) // bits per sample
  buffer.write('data', 36)
  buffer.writeUInt32LE(numSamples * 2, 40)

  // Generate sine wave with envelope
  for (let n = 0; n < numSamples; n++) {
    const t = n / sampleRate
    const envelope = Math.exp(-3 * t / duration)
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5
    buffer.writeInt16LE(Math.floor(sample * 32767), 44 + n * 2)
  }

  const filename = join(soundsDir, `bell-${i + 1}.wav`)
  writeFileSync(filename, buffer)
  console.log(`Generated ${filename}`)
}
```

- [ ] **Step 2: 运行脚本生成铃声**

```bash
cd /d/Git/your-health
node scripts/setup-sounds.mjs
```

预期:输出 5 个 "Generated ..." 行,在 `src/assets/sounds/` 下生成 5 个 WAV 文件。

- [ ] **Step 3: 验证文件**

```bash
ls -la src/assets/sounds/
```

预期:看到 5 个 bell-*.wav 文件,每个 < 50KB。

- [ ] **Step 4: 添加 README 说明**

在 `src/assets/sounds/README.md`(或主 README):

```markdown
# 内置铃声

5 个 `bell-{1..5}.wav` 占位文件,由 `scripts/setup-sounds.mjs` 生成。

**生产替换方案**:
1. 从 Freesound.org 等免费音效库下载 5 个 2-3 秒的铃声
2. 替换 `src/assets/sounds/bell-{1..5}.wav`
3. 保持文件名不变,WAV 格式
```

- [ ] **Step 5: 提交**

```bash
git add src/assets/sounds/ scripts/setup-sounds.mjs
git commit -m "feat: generate 5 placeholder bell sounds (replace in production)"
```

---

## 任务 19:README 文档

**Files:**
- Create: `README.md`

- [ ] **Step 1: 创建 README**

创建 `README.md`:

````markdown
# Your Health — 久坐提醒

一个基于 Tauri 2.x + Vue 3 + TypeScript 的桌面健康软件 MVP,核心功能是**久坐闹钟提醒**。

## 功能

- 可配置提醒时长(30/45/60/90 分钟,默认 45)
- 5 个内置铃声
- 开始 / 中断 / 结束 三按钮
- 圆环倒计时可视化
- 强提醒:时间到 → 全屏弹窗 + 循环铃声
- 设置自动持久化

## 技术栈

Tauri 2.x · Vue 3 · TypeScript · Pinia · vue-router · Vitest

## 开发

```bash
npm install
npm run tauri dev      # 开发模式
npm run test           # 单元 + 组件测试
npm run test:rust      # Rust 单元测试
npm run build          # 前端构建
npm run tauri build    # 打包桌面应用
```

## 系统要求

- Node.js 18+
- Rust 1.70+
- Windows: WebView2 Runtime(Win11 自带,Win10 需手动安装)
- macOS: 无额外要求
- Linux: webkit2gtk

## 目录结构

参见 `docs/superpowers/specs/2026-07-29-sedentary-reminder-design.md` §4。

## 设计文档

- [设计文档](docs/superpowers/specs/2026-07-29-sedentary-reminder-design.md)
- [实施计划](docs/superpowers/plans/2026-07-29-sedentary-reminder.md)

## 已知限制(MVP)

- 不留提醒历史
- 不支持自定义铃声
- 不支持开机自启
- 不支持 macOS / Linux 验证(开发机为 Windows)
````

- [ ] **Step 2: 提交**

```bash
git add README.md
git commit -m "docs: add README with dev instructions"
```

---

## 任务 20:E2E 测试(Playwright + tauri-driver)

**Files:**
- Create: `tests/e2e/reminder-flow.spec.ts`, `playwright.config.ts`

- [ ] **Step 1: 安装 Playwright**

```bash
cd /d/Git/your-health
npm install -D @playwright/test
npx playwright install
```

- [ ] **Step 2: 创建 Playwright 配置**

创建 `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
})
```

- [ ] **Step 3: 创建冒烟测试**

创建 `tests/e2e/reminder-flow.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('久坐提醒 - 冒烟测试', () => {
  test('应用启动显示 idle 状态', async ({ page }) => {
    // 注:此测试需要先运行 npm run tauri dev
    // tauri-driver 会自动连接到 Tauri 应用
    await page.goto('tauri://localhost')
    await expect(page.locator('text=未开始')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('text=开始')).toBeVisible()
  })

  test('点开始 → 进入 running 状态', async ({ page }) => {
    await page.goto('tauri://localhost')
    await page.locator('text=开始').click()
    await expect(page.locator('text=中断')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('text=结束')).toBeVisible()
  })
})
```

- [ ] **Step 4: 添加 E2E 文档到 README**

修改 `README.md`,在"开发"段下添加:

````markdown
## E2E 测试

需要先启动 Tauri 应用:

```bash
# Terminal 1
npm run tauri dev

# Terminal 2
npm run test:e2e
```
````

- [ ] **Step 5: 验证 Playwright 配置可加载**

```bash
cd /d/Git/your-health
npx playwright test --list
```

预期:列出 `reminder-flow.spec.ts` 中的 2 个测试。

- [ ] **Step 6: 提交**

```bash
git add tests/ playwright.config.ts package.json package-lock.json README.md
git commit -m "test: e2e smoke tests with Playwright + tauri-driver"
```

---

## 任务 21:构建验证

**Files:**
- None(纯验证)

- [ ] **Step 1: 运行所有测试**

```bash
cd /d/Git/your-health
npm test
npm run test:rust
```

预期:
- Vitest:全部 PASS(预期 ≥ 33 个测试)
- Cargo: `default_config` PASS

- [ ] **Step 2: TypeScript 类型检查**

```bash
npx vue-tsc --noEmit
```

预期:无错误。

- [ ] **Step 3: 前端构建**

```bash
npm run build
```

预期:生成 `dist/`,无错误。

- [ ] **Step 4: 启动 dev 模式做手动 smoke**

```bash
npm run tauri dev
```

预期:
- Tauri 窗口打开
- 显示 "未开始" + "开始" 按钮
- 点击"开始" → 圆环开始动,显示倒计时
- 点击"中断" → 状态变 "已暂停"
- 点击"继续" → 状态恢复 "剩余"
- 点击"设置" → 跳到设置页,可改时长和铃声
- 返回主页,点"结束" → 回到 idle

**手动验证完成后关闭窗口(Ctrl+C)**。

- [ ] **Step 5: 打包应用**

```bash
npm run tauri build
```

预期:生成可执行文件在 `src-tauri/target/release/bundle/`。

- [ ] **Step 6: 最终提交**

```bash
git add -A
git commit -m "chore: verify MVP build pipeline (build, dev, e2e)"
git tag v0.1.0
```

---

## 自审(对照 Spec)

按 writing-plans 流程 self-review:

### 1. Spec 覆盖 ✓

| Spec 章节 | 实施任务 |
|----------|---------|
| 概述 | 全局 |
| 目标/非目标 | 任务 1-21 严格遵守 YAGNI |
| 技术栈 | 任务 1-2 |
| 目录结构 | 任务 1-3, 6-18 |
| 数据模型 | 任务 3 |
| 状态机 | 任务 4-5 |
| 失焦补偿 | 任务 5 |
| 数据持久化 | 任务 14-15 |
| UI 设计(主题/三视图) | 任务 9, 11-13 |
| 提醒触发流程 | 任务 17 |
| 铃声与播放 | 任务 16, 18 |
| 错误处理 | 任务 4(状态守卫), 14(命令错误返回), 15(load 失败回退) |
| 测试策略 | 任务 4-8, 15-16(单测), 20(E2E) |
| 未来扩展预留 | 代码结构层(composable 抽象,interface 形式) |
| 验收标准 | 任务 21 |

### 2. 占位符扫描 ✓

无 "TBD" / "TODO" / "fill in"。"TODO" 仅出现在 README 的"已知限制"段(明确标记 MVP 范围外)。

### 3. 类型一致性 ✓

- `TimerState` / `TimerData` / `AppConfig` 在任务 3 定义,任务 4-21 一致使用
- `tick(elapsedSeconds: number)` 在任务 4 定义,任务 5 调用方式一致
- `convertFileSrc(path)` 在任务 15 引用,任务 16 实现并使用
- `openAlertWindow` / `closeAlertWindow` 在任务 14 定义,任务 15 导出,任务 17 调用 — 一致

---

**计划结束。等待用户选择执行方式。**