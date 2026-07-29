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
