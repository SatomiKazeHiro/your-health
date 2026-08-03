import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import { DEFAULT_CONFIG } from '@/types'
import { useAlerting } from './useAlerting'

const { openAlertWindowMock } = vi.hoisted(() => ({
  openAlertWindowMock: vi.fn(),
}))

vi.mock('@/lib/tauri', () => ({
  openAlertWindow: openAlertWindowMock,
}))

function withAlerting() {
  return defineComponent({
    setup() {
      useAlerting()
      return () => h('div')
    },
  })
}

describe('useAlerting', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    openAlertWindowMock.mockReset()
    openAlertWindowMock.mockResolvedValue(undefined)
  })

  it('running → alerting 触发 openAlertWindow,带完整 query', async () => {
    const store = useTimerStore()
    store.applyConfig({ ...DEFAULT_CONFIG, durationMinutes: 45, soundId: 'bell-2', volume: 0.3 })

    mount(withAlerting())
    await flushPromises()
    expect(openAlertWindowMock).not.toHaveBeenCalled()

    store.start()
    await flushPromises()
    expect(openAlertWindowMock).not.toHaveBeenCalled()

    store.$patch({ state: 'alerting' })
    await flushPromises()

    expect(openAlertWindowMock).toHaveBeenCalledTimes(1)
    const urlPath = openAlertWindowMock.mock.calls[0][0] as string
    expect(urlPath).toMatch(/^\/alert\?/)
    expect(urlPath).toContain('minutes=45')
    expect(urlPath).toContain('sound=bell-2')
    expect(urlPath).toContain('volume=0.3')
  })

  it('其他状态转换不触发', async () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)

    mount(withAlerting())
    await flushPromises()
    store.start()
    await flushPromises()
    store.pause()
    await flushPromises()
    store.$patch({ state: 'idle' })

    expect(openAlertWindowMock).not.toHaveBeenCalled()
  })

  it('openAlertWindow 失败时只 console.error,不抛出', async () => {
    openAlertWindowMock.mockRejectedValue(new Error('boom'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    store.start()

    mount(withAlerting())
    await flushPromises()
    store.$patch({ state: 'alerting' })
    await flushPromises()

    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})