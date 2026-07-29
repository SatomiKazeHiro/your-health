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
