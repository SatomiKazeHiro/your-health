# 久坐提醒软件 — 设计文档

**日期**: 2026-07-29
**状态**: Draft(待用户审查)
**作者**: brainstorm 输出

---

## 1. 概述

一个基于 **Tauri 2.x + Vue 3 + TypeScript** 的桌面健康软件 MVP。核心功能是**久坐闹钟提醒**:用户设置一个时长,程序倒计时,时间到了就以强提醒的方式通知用户活动。

未来可扩展(本设计不包含):智能检测久坐(B 功能)、历史统计图表、多语言、其他健康维度(饮水、护眼等)。

---

## 2. 目标与非目标

### 2.1 目标

- ✅ 提供**清晰的倒计时可视化**(圆环 + 文字)
- ✅ **强提醒**:倒计时归零后,弹窗 + 铃声必须被用户响应才能解除
- ✅ 三个核心操作:**开始 / 中断 / 结束**
- ✅ 可配置:**提醒时长**(30/45/60/90 分钟)+ **铃声**(5 个内置)
- ✅ 设置**持久化**:重启应用后保留用户配置
- ✅ 跨平台(理论上):Tauri 支持 Windows / macOS / Linux,MVP 先在开发机跑通

### 2.2 非目标(明确 YAGNI)

- ❌ 智能检测久坐(空闲输入监听)—— 留 TODO,未来做
- ❌ 提醒历史/统计/图表 —— 不留历史
- ❌ 自定义铃声上传 —— 仅内置 5 个
- ❌ 多语言 —— 只做中文
- ❌ 多提醒类型(饮水/护眼等)—— 只做久坐
- ❌ 主题切换/界面定制 —— 单一治愈绿主题
- ❌ 开机自启 / 系统托盘 —— 暂不做
- ❌ 云同步 / 账号体系 —— 完全本地
- ❌ 移动端 —— 只做桌面

---

## 3. 技术栈

| 层 | 选型 | 版本 | 理由 |
|----|------|------|------|
| 桌面运行时 | **Tauri** | 2.x | 官方活跃维护,体积小,性能优于 Electron |
| 前端框架 | **Vue** | 3.4+ | 组合式 API 适合状态机场景 |
| 类型系统 | **TypeScript** | 5.x | 状态机需要严格类型保护 |
| 构建工具 | **Vite** | 5.x | Tauri 模板默认 |
| 状态管理 | **Pinia** | 2.x | Vue 3 官方推荐 |
| 路由 | **vue-router** | 4.x | 主页面 / 设置页 / 提醒页 |
| 持久化 | **@tauri-apps/plugin-store** | latest | 官方插件,跨平台路径自动 |
| 单元测试 | **Vitest** | latest | Vite 原生 |
| 组件测试 | **@vue/test-utils** | latest | Vue 3 官方 |
| E2E 测试 | **Playwright + tauri-driver** | latest | 跨平台 E2E |

---

## 4. 目录结构

```
your-health/
├── src/                              # 前端
│   ├── App.vue
│   ├── main.ts
│   ├── router/
│   │   └── index.ts                  # 路由配置
│   ├── views/
│   │   ├── HomeView.vue              # 主页
│   │   ├── SettingsView.vue          # 设置页
│   │   └── AlertView.vue             # 提醒弹窗
│   ├── stores/
│   │   └── timerStore.ts             # 状态机 + 倒计时
│   ├── composables/
│   │   ├── useTimer.ts               # 倒计时引擎
│   │   ├── useAudio.ts               # 铃声播放
│   │   └── useConfig.ts              # 配置读写
│   ├── components/
│   │   ├── ProgressRing.vue          # 圆环组件
│   │   ├── CountdownText.vue         # MM:SS 文字
│   │   └── PillButton.vue            # 胶囊按钮
│   ├── assets/
│   │   ├── sounds/
│   │   │   ├── bell-1.wav            # 内置铃声 1
│   │   │   ├── bell-2.wav            # 内置铃声 2
│   │   │   ├── bell-3.wav
│   │   │   ├── bell-4.wav
│   │   │   └── bell-5.wav
│   │   └── styles/
│   │       ├── theme.css             # 主题变量
│   │       └── main.css
│   ├── i18n/
│   │   └── zh-CN.ts                  # 中文文案
│   └── types/
│       └── index.ts                  # 全局类型
├── src-tauri/                        # Rust 后端
│   ├── src/
│   │   ├── main.rs                   # 入口
│   │   ├── lib.rs
│   │   ├── commands.rs               # Tauri Commands
│   │   └── config.rs                 # 配置读写逻辑
│   ├── tauri.conf.json
│   └── Cargo.toml
├── tests/                            # E2E
│   └── e2e/
│       └── reminder-flow.spec.ts
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-07-29-sedentary-reminder-design.md
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 5. 核心数据模型

### 5.1 状态机类型

```typescript
// types/index.ts

export type TimerState = 'idle' | 'running' | 'paused' | 'alerting'

export interface TimerData {
  state: TimerState
  totalSeconds: number
  remainingSeconds: number
  selectedDuration: number  // 分钟
  selectedSound: string     // 铃声 ID
}

export const DURATION_OPTIONS = [30, 45, 60, 90] as const
export type DurationOption = typeof DURATION_OPTIONS[number]

export const SOUND_OPTIONS = [
  { id: 'bell-1', label: '清脆铃声' },
  { id: 'bell-2', label: '柔和提示' },
  { id: 'bell-3', label: '鸟鸣叮咚' },
  { id: 'bell-4', label: '电子提示' },
  { id: 'bell-5', label: '木质风铃' },
] as const
export type SoundId = typeof SOUND_OPTIONS[number]['id']
```

### 5.2 配置

```typescript
export interface AppConfig {
  durationMinutes: DurationOption   // 默认 45
  soundId: SoundId                  // 默认 'bell-1'
  volume: number                    // 0.0 - 1.0,默认 0.7
}

export const DEFAULT_CONFIG: AppConfig = {
  durationMinutes: 45,
  soundId: 'bell-1',
  volume: 0.7,
}
```

---

## 6. 状态机

### 6.1 状态图

```
                    start()
        ┌──────────────────────────┐
        │                          ▼
     [ idle ]                    [ running ]
        ▲                          │   │
        │                          │   │
        │ end()                   pause() resume()
        │                          │   │
        │                          ▼   ▲
        └──────────────────────[ paused ]
        ▲                          │
        │ end()                   end()
        │                          ▼
        └──────────────────────────┘

                  remaining = 0
        ┌──────────────────────────┐
        │                          ▼
        └───────────────────── [ alerting ]
                                  │
                                  acknowledge() ──→ idle
                                  snooze()       ──→ running (remaining=300)
```

### 6.2 状态转换表

| 当前态 | 触发动作 | 下一态 | 副作用 |
|--------|----------|--------|--------|
| idle | start() | running | remaining = totalSeconds;启动 setInterval |
| running | tick(每秒) | running | remaining -= 1 |
| running | remaining === 0 | alerting | 打开 AlertView 窗口;开始循环播放铃声 |
| running | pause() | paused | 暂停 setInterval;记录 pausedAt |
| paused | resume() | running | 重启 setInterval |
| paused | end() | idle | 停止 setInterval |
| running | end() | idle | 停止 setInterval |
| alerting | acknowledge() | idle | 关闭 AlertView;停止铃声 |
| alerting | snooze() | running | remaining = 300(硬编码 5 分钟);关闭 AlertView;停止铃声 |

### 6.3 倒计时实现关键点

**失焦补偿**:浏览器/WebView 后台的 `setInterval` 会被节流(Chromium 后台节流策略)。解决方案:

```typescript
// composables/useTimer.ts 关键逻辑

let lastTickAt = Date.now()
let intervalId: number | null = null

function tick() {
  const now = Date.now()
  const elapsed = Math.floor((now - lastTickAt) / 1000)
  remaining.value = Math.max(0, remaining.value - elapsed)
  lastTickAt = now

  if (remaining.value === 0) {
    transitionTo('alerting')
  }
}

function start() {
  lastTickAt = Date.now()
  intervalId = window.setInterval(tick, 1000)
}

// 焦点回来时立即补偿
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && intervalId !== null) {
    tick() // 补偿可能丢失的时间
  }
})
```

**Worker 不采用**:Chromium 后台节流对 Web Worker 同样有效,MVP 不引入 Worker 复杂度。

---

## 7. 数据持久化

- **方案**:`@tauri-apps/plugin-store`
- **存储位置**:操作系统标准配置目录(Tauri 自动处理)
  - Windows: `%APPDATA%\com.yourhealth.app\config.json`
  - macOS: `~/Library/Application Support/com.yourhealth.app/config.json`
  - Linux: `~/.local/share/com.yourhealth.app/config.json`

### 7.1 读写时机

| 触发点 | 操作 |
|--------|------|
| App 启动 | `await store.load()` → 合并 `DEFAULT_CONFIG` |
| SettingsView 用户改动 | 防抖 500ms 后 `store.set(key, value)` |
| 读取配置 | Pinia 单例持有,所有视图读 |

### 7.2 不持久化(明确)

- 当前倒计时状态(退出即丢)
- 提醒历史
- 用户偏好之外的东西

---

## 8. UI 设计

### 8.1 主题

- **治愈绿**(B 风格) + **胶囊按钮**(D 风格)
- 背景:`linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)`
- 主色:`#16a34a`(绿 600)
- 强调色:`#14532d`(绿 900)
- 辅助色:`#15803d`(绿 700)
- 文字:`#14532d` / `#15803d`

### 8.2 HomeView 主页

三种状态(共享布局,中央圆环 + 文字 + 下方按钮):

- **idle**:空圆环 + "未开始" + "设置:45 分钟" + 大"开始"按钮 + 小"⚙ 设置"链接
- **running**:进度圆环(实色描边) + 倒计时 `32:14` + "中断"/"结束"两按钮
- **paused**:虚线圆环 + 静态时间 + "继续"(实心绿)/ "结束"

### 8.3 SettingsView 设置页

- 顶部:← 返回 + "设置"
- 分区"提醒":
  - 提醒时长(下拉):30/45/60/90 分钟
  - 提醒铃声(下拉):5 个内置铃声中文别名
  - 音量(滑块):0-100%,默认 70%
- 分区"预览":
  - ▶ 试听铃声按钮
- 底部:版本号 `v0.1.0`

### 8.4 AlertView 提醒弹窗

- 全屏绿色背景:`linear-gradient(180deg, #16a34a, #15803d)`
- 大图标 🚶 + 大字"该起来活动啦!"
- 副标题:"你已经坐了 45 分钟,起来走走吧"
- 大字 `45:00` 显示本次久坐时长
- 两按钮:
  - "延后 5 分钟"(透明描边白)
  - "我知道了"(白底绿字实色)

### 8.5 窗口规格

| 窗口 | 尺寸 | 装饰 | 置顶 | 全屏 |
|------|------|------|------|------|
| HomeView / SettingsView | 自适应 | 有 | 否 | 否 |
| AlertView | 600×480 | 无边框 | 是 | 否 |

---

## 9. 提醒触发完整流程

```
[timerStore.remaining = 0]
       ↓
┌────────────────────────────────────────┐
│ Tauri Command: open_alert_window()     │
│   - 创建 WebviewWindow 'alert'         │
│   - url: /#/alert                      │
│   - decorations: false                 │
│   - alwaysOnTop: true                  │
└────────────────────────────────────────┘
       ↓
┌────────────────────────────────────────┐
│ AlertView.vue mounted                  │
│   - useAudio.play(soundId, volume)     │
│   - 启动 1s 本地计时器(显示已坐时长)   │
│   - 渲染按钮                          │
└────────────────────────────────────────┘
       ↓
[ 用户响应 ]
       ├─ 点击"我知道了" → emit('acknowledge')
       │   → Tauri Command: close_alert_window() + audio.stop()
       │   → timerStore: alerting → idle
       │
       └─ 点击"延后 5 分钟" → emit('snooze')
           → Tauri Command: close_alert_window() + audio.stop()
           → timerStore: alerting → running(remaining = 300)
```

### 9.1 铃声播放实现

```typescript
// composables/useAudio.ts
import { ref } from 'vue'
import { convertFileSrc } from '@tauri-apps/api/core'

export function useAudio() {
  const audioRef = ref<HTMLAudioElement | null>(null)

  function play(soundId: string, volume: number) {
    const url = convertFileSrc(`assets/sounds/${soundId}.wav`)
    audioRef.value = new Audio(url)
    audioRef.value.volume = volume
    audioRef.value.loop = true
    audioRef.value.play().catch((err) => {
      console.warn('Audio play failed:', err)
      // Fallback: 系统通知
    })
  }

  function stop() {
    audioRef.value?.pause()
    audioRef.value = null
  }

  return { play, stop }
}
```

---

## 10. 错误处理

| 场景 | 处理 |
|------|------|
| **铃声 autoplay 被拦截** | 首次点击"开始"时 unlock audio context;失败则 fallback 系统通知 |
| **配置文件损坏/不存在** | 捕获异常 → 使用 `DEFAULT_CONFIG` → 不阻塞启动 |
| **窗口创建失败(AlertView)** | Fallback 到主窗口顶部 banner + 模态遮罩 + 铃声 |
| **Tauri IPC 不可用** | 检测 `window.__TAURI__`;不可用显示友好提示(理论上 dev/build 后不会触发) |
| **用户硬关闭 AlertView** | 接受,音频停,状态切回 idle |
| **应用启动 store 未就绪** | 显示 loading,等 `store.load()` resolve 后渲染 |

**原则**:
1. 永远不让错误导致白屏
2. 不弹技术性错误给用户
3. 配置错误静默回退默认值
4. MVP 不接 Sentry 等远程日志

---

## 11. 测试策略

### 11.1 测试范围

| 层 | 工具 | 重点 |
|----|------|------|
| 状态机纯逻辑 | Vitest | timerStore 状态转换、remaining 计算、visibilitychange 补偿 |
| Vue 组件 | Vue Test Utils + Vitest | ProgressRing / CountdownText / PillButton |
| Tauri Command | Rust 单元测试 | 配置读写、窗口创建 |
| E2E | Playwright + tauri-driver | 启动 → 开始 → 暂停 → 结束 冒烟 |

### 11.2 必测用例

**状态机(100% 覆盖)**
- 所有状态转换的 happy path
- `running → remaining=0 → alerting`
- `paused → resume`,remaining 不变
- **visibilitychange 补偿**:模拟失焦 N 秒,焦点回来 remaining 正确
- 边界:remaining = 0 时恰好 tick
- 边界:snooze 后正好 5 分钟到期

**Tauri Command**
- `load_config`:空文件 → 默认值;损坏 JSON → 默认值;正常 → 解析
- `save_config`:写入后能读回

**组件 smoke**
- ProgressRing 在 0% / 50% / 100% 时 SVG 正确
- CountdownText 把秒数正确格式化 MM:SS

**E2E(MVP 一次冒烟)**
- 应用启动 → 显示 idle → 点开始 → 倒计时减少 → 点暂停 → 状态变更

### 11.3 不做

- 视觉回归(像素对比) — 太重
- 性能测试 — 无并发压力
- 跨平台 E2E 矩阵 — MVP 只在开发机跑通

### 11.4 测试命令

```bash
npm run test          # Vitest 单元 + 组件
npm run test:e2e      # Playwright
npm run test:rust     # cargo test
```

---

## 12. 未来扩展(明确 TODO,代码层预留)

| TODO | 预留位置 |
|------|----------|
| 智能检测久坐(B 功能) | `idleDetector` interface(当前 `null`) |
| Rust 后端定时器(方案乙) | timerStore 的 `tick()` 抽象,可换实现 |
| 历史记录 / 统计图表 | `statsStore` 占位 |
| 多语言 | `i18n/zh-CN.ts` + 预留 `en-US.ts` 路径 |
| 更多提醒类型 | `ReminderType` 枚举(MVP 只有 'sedentary') |
| Snooze 时长可配置 | 配置项 `snoozeMinutes`(MVP 硬编码 5 分钟) |
| 开机自启 | Tauri plugin |
| 系统托盘 | Tauri tray API |
| 自定义铃声上传 | SettingsView 增加上传入口 |
| 跨平台 E2E | CI matrix |

---

## 13. 实施步骤(高层)

1. **脚手架**:`npm create tauri-app@latest` → Vue 3 + TS 模板 → 跑通默认 hello world
2. **类型与状态机**:写 `types/index.ts` 和 `timerStore.ts`(纯逻辑先于 UI)
3. **核心组件**:ProgressRing / CountdownText / PillButton(纯展示,无状态)
4. **HomeView**:三种状态串联起来,先跑通 idle ↔ running ↔ paused
5. **配置持久化**:`useConfig` + `tauri-plugin-store`,SettingsView
6. **音频 + AlertView**:`useAudio` + AlertView + Tauri 窗口创建
7. **错误处理 + 边界**:fallback 路径,visibilitychange 补偿
8. **测试**:Vitest 状态机先跑通,组件次之,E2E 最后
9. **打包验证**:`npm run tauri build`,在 Windows/macOS 跑一次
10. **README + 用户文档**:安装方法、截图、已知限制

---

## 14. 风险与缓解

| 风险 | 缓解 |
|------|------|
| Tauri 2.x 在 Windows 上 WebView2 安装问题 | README 注明 WebView2 Runtime 依赖 |
| 内置铃声文件获取失败 | 预留 `npm run setup-sounds` 脚本,从 Freesound API 下载 |
| 浏览器 autoplay 策略阻止首次播放 | "开始"按钮的 click handler 内调用 unlock |
| 时区/系统时间被修改 | MVP 不处理,信任系统时钟 |
| 用户最小化主窗口 | 接受节流,依赖 visibilitychange 补偿 |

---

## 15. 验收标准(MVP 完成定义)

- [ ] 应用可在开发机启动,无控制台报错
- [ ] 设置页可改时长(30/45/60/90)和铃声(5 个),重启后保留
- [ ] 主页三种状态(idle/running/paused)切换正常,圆环动画流畅
- [ ] 开始 → 倒计时 → 归零 → 弹窗 + 铃声,持续响铃
- [ ] "我知道了"关闭弹窗 + 停止铃声
- [ ] "延后 5 分钟"关闭弹窗 + 重置 5 分钟倒计时
- [ ] 中断后能继续,剩余时间正确
- [ ] 失焦/最小化后回到前台,倒计时准确
- [ ] Vitest 测试全绿
- [ ] E2E 冒烟通过

---

## 附录 A:决策日志

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 久坐判断 | A. 纯时长计时 | 用户选择,B 留 TODO |
| 归零响应 | A. 窗口内强提醒 | 用户选择 |
| 中断语义 | A. 暂停当前周期 | 用户选择,语义清晰 |
| 数据持久化 | A. 只保存设置 | YAGNI,范围控制 |
| 归零未响应 | A. 持续响铃 | 用户选择,强提醒 |
| 铃声 | A. 内置 5 个 | 用户选择,避免路径/版权问题 |
| UI 风格 | B 治愈绿 + D 胶囊按钮 | 用户选择 |
| 时长默认值 | B. 45 分钟 | 用户选择 |
| 架构方案 | 甲. 前端主导 | MVP 阶段,Rust 后端留 TODO |

---

## 附录 B:TODO 清单(MVP 后)

- [ ] 智能检测久坐(系统空闲 API)
- [ ] Rust 后端定时器
- [ ] 历史记录 + 图表
- [ ] Snooze 时长可配置
- [ ] 开机自启
- [ ] 系统托盘
- [ ] 自定义铃声上传
- [ ] 多语言
- [ ] 其他健康维度(饮水/护眼等)
- [ ] macOS / Linux 平台验证

---

**文档结束。请用户审查并确认后,进入实施计划阶段。**