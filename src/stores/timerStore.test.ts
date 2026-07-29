import { describe, it, expect, beforeEach, vi } from 'vitest'
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
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T10:00:00Z'))
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    vi.setSystemTime(new Date('2026-07-29T10:01:00Z'))
    store.recompute()
    store.pause()
    const paused = store.remainingSeconds
    store.resume()
    expect(store.state).toBe('running')
    expect(store.remainingSeconds).toBe(paused)
    vi.useRealTimers()
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

  it('start() 在 1 秒后 tick 应该让 remaining 减少 1', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T10:00:00Z'))
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    expect(store.remainingSeconds).toBe(45 * 60)
    vi.setSystemTime(new Date('2026-07-29T10:00:01Z'))
    store.recompute()
    expect(store.remainingSeconds).toBe(45 * 60 - 1)
    vi.useRealTimers()
  })

  it('最小化 30 秒:recompute 应该按 wall clock 一次性补回', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T10:00:00Z'))
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    const totalAtStart = store.remainingSeconds
    // 模拟 30 秒内没有 tick
    vi.setSystemTime(new Date('2026-07-29T10:00:30Z'))
    store.recompute()
    expect(store.remainingSeconds).toBe(totalAtStart - 30)
    vi.useRealTimers()
  })

  it('倒计时归零时 recompute 应该自动转入 alerting', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T10:00:00Z'))
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    vi.setSystemTime(new Date('2026-07-29T10:45:00Z'))
    store.recompute()
    expect(store.state).toBe('alerting')
    expect(store.remainingSeconds).toBe(0)
    vi.useRealTimers()
  })

  it('acknowledge() 从 alerting 转到 idle', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T10:00:00Z'))
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    vi.setSystemTime(new Date('2026-07-29T10:45:00Z'))
    store.recompute()
    store.acknowledge()
    expect(store.state).toBe('idle')
    vi.useRealTimers()
  })

  it('snooze() 从 alerting 转到 running,remaining = 300', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T10:00:00Z'))
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()
    vi.setSystemTime(new Date('2026-07-29T10:45:00Z'))
    store.recompute()
    store.snooze()
    expect(store.state).toBe('running')
    expect(store.remainingSeconds).toBe(SNOOZE_SECONDS)
    vi.useRealTimers()
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
