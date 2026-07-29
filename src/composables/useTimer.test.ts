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
