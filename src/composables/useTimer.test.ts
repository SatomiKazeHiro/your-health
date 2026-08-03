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

    // 模拟失焦 30 秒:系统时钟前进,但 setInterval 回调被节流(不触发)
    // 真实浏览器后台 tab 会合并 interval,这里用 setSystemTime 模拟
    vi.setSystemTime(Date.now() + 30000)

    // 模拟焦点回来,触发 visibilitychange
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(store.remainingSeconds).toBe(before - 30)
  })

  it('window focus 事件触发补偿', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    const timer = useTimer()
    timer.start()
    vi.advanceTimersByTime(2000)
    const before = store.remainingSeconds

    vi.setSystemTime(Date.now() + 30000)
    window.dispatchEvent(new Event('focus'))

    expect(store.remainingSeconds).toBe(before - 30)
  })

  it('window blur 事件触发补偿', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    const timer = useTimer()
    timer.start()
    vi.advanceTimersByTime(2000)
    const before = store.remainingSeconds

    vi.setSystemTime(Date.now() + 30000)
    window.dispatchEvent(new Event('blur'))

    expect(store.remainingSeconds).toBe(before - 30)
  })

  it('计时结束后可以重新开始', () => {
    const store = useTimerStore()
    store.applyConfig({ ...DEFAULT_CONFIG, durationMinutes: 1 })
    const timer = useTimer()
    timer.start()

    vi.advanceTimersByTime(60000)
    expect(store.state).toBe('alerting')

    store.acknowledge()
    timer.start()
    expect(store.state).toBe('running')
  })

  it('snooze() 后会从 5 分钟重新开始倒计时', async () => {
    const store = useTimerStore()
    store.applyConfig({ ...DEFAULT_CONFIG, durationMinutes: 1 })
    const timer = useTimer()
    timer.start()

    vi.advanceTimersByTime(60000)
    expect(store.state).toBe('alerting')

    store.snooze()
    expect(store.state).toBe('running')
    expect(store.remainingSeconds).toBe(300)

    await Promise.resolve()
    vi.advanceTimersByTime(3000)
    expect(store.remainingSeconds).toBe(297)
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
