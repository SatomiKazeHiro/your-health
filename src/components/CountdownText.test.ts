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
    expect(wrapper.find('time').attributes('style')).toContain('font-size: 48px')
  })

  it('font="serif" 使用 serif 字体栈与 tabular-nums', () => {
    const wrapper = mount(CountdownText, {
      props: { seconds: 60, font: 'serif' },
    })
    const style = wrapper.find('time').attributes('style') ?? ''
    expect(style).toContain('font-display')
    expect(style).toContain('tabular-nums')
  })
})