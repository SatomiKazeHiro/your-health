import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HomeView from './HomeView.vue'
import { useTimerStore } from '@/stores/timerStore'
import { DEFAULT_CONFIG } from '@/types'

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
  emitTo: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/tauri', () => ({
  openAlertWindow: vi.fn().mockResolvedValue(undefined),
  closeAlertWindow: vi.fn().mockResolvedValue(undefined),
  loadConfig: vi.fn(),
  saveConfig: vi.fn(),
}))

function mountHome(attachToBody = false) {
  return mount(HomeView, attachToBody ? { attachTo: document.body } : {})
}

describe('HomeView 状态切换', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('idle 状态显示开始按钮和设置入口', () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    const wrapper = mountHome()
    expect(wrapper.text()).toContain('开始')
    expect(wrapper.text()).toContain('设置')
    expect(wrapper.text()).toContain('45:00')
  })

  it('点击开始进入 running,显示中断按钮', async () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    const wrapper = mountHome()
    const startBtn = wrapper.findAll('button').find((b) => b.text().includes('开始'))!
    await startBtn.trigger('click')
    await flushPromises()

    expect(store.state).toBe('running')
    expect(wrapper.text()).toContain('中断')
  })

  it('idle → running → paused → idle 路径,end 走 confirm 弹窗', async () => {
    const store = useTimerStore()
    store.applyConfig(DEFAULT_CONFIG)
    const wrapper = mountHome(true)
    await flushPromises()

    await wrapper.findAll('button').find((b) => b.text().includes('开始'))!.trigger('click')
    await flushPromises()
    expect(store.state).toBe('running')

    await wrapper.findAll('button').find((b) => b.text() === '中断')!.trigger('click')
    await flushPromises()
    expect(store.state).toBe('paused')
    expect(wrapper.text()).toContain('已暂停')

    // paused 面板里的"结束"按钮触发 confirm modal;teleport 到 body
    await wrapper.findAll('button').find((b) => b.text() === '结束')!.trigger('click')
    await flushPromises()
    expect(document.body.textContent).toContain('结束本次计时')

    // modal 内部有两个 button(取消、结束),dialog 限定避免点中 paused panel 的同名按钮
    const dialog = document.body.querySelector('[role="dialog"]')!
    const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === '结束'
    )!
    confirmBtn.click()
    await flushPromises()
    expect(store.state).toBe('idle')
  })
})