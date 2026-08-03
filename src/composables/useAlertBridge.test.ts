import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import { DEFAULT_CONFIG } from '@/types'
import { useAlertBridge } from './useAlertBridge'
import { ALERT_ACTION_EVENT } from '@/lib/events'

const { listenMock, unlistenMock } = vi.hoisted(() => {
  const listenMock = vi.fn()
  const unlistenMock = vi.fn()
  return { listenMock, unlistenMock }
})

vi.mock('@tauri-apps/api/event', () => ({
  listen: listenMock,
}))

function withBridge() {
  return defineComponent({
    setup() {
      useAlertBridge()
      return () => h('div')
    },
  })
}

describe('useAlertBridge', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    listenMock.mockReset()
    unlistenMock.mockReset()
    listenMock.mockResolvedValue(unlistenMock)
  })

  it('挂载时监听 alert:action 事件', async () => {
    mount(withBridge())
    await flushPromises()
    expect(listenMock).toHaveBeenCalledWith(ALERT_ACTION_EVENT, expect.any(Function))
  })

  it('收到 acknowledge payload 调用 store.acknowledge()', async () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.acknowledge = vi.fn()

    mount(withBridge())
    await flushPromises()

    const handler = listenMock.mock.calls[0][1] as (event: { payload: unknown }) => void
    handler({ payload: { action: 'acknowledge' } })
    expect(store.acknowledge).toHaveBeenCalled()
  })

  it('收到 snooze payload 调用 store.snooze()', async () => {
    const store = useTimerStore()
    store.acknowledge = vi.fn()
    store.snooze = vi.fn()

    mount(withBridge())
    await flushPromises()

    const handler = listenMock.mock.calls[0][1] as (event: { payload: unknown }) => void
    handler({ payload: { action: 'snooze' } })
    expect(store.snooze).toHaveBeenCalled()
    expect(store.acknowledge).not.toHaveBeenCalled()
  })

  it('未知 action 被忽略', async () => {
    const store = useTimerStore()
    store.acknowledge = vi.fn()
    store.snooze = vi.fn()

    mount(withBridge())
    await flushPromises()

    const handler = listenMock.mock.calls[0][1] as (event: { payload: unknown }) => void
    handler({ payload: { action: 'nonsense' } })
    expect(store.acknowledge).not.toHaveBeenCalled()
    expect(store.snooze).not.toHaveBeenCalled()
  })
})