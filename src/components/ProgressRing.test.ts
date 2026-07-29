import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressRing from './ProgressRing.vue'

describe('ProgressRing', () => {
  it('渲染 SVG 元素', () => {
    const wrapper = mount(ProgressRing, {
      props: { progress: 0.5, size: 200 },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('progress = 0 时,描边偏移为周长', () => {
    const wrapper = mount(ProgressRing, {
      props: { progress: 0, size: 200 },
    })
    const circle = wrapper.find('circle.progress')
    // 周长 = 2 * π * 86 ≈ 540
    expect(circle.attributes('stroke-dashoffset')).toBe('540')
  })

  it('progress = 1 时,描边偏移为 0', () => {
    const wrapper = mount(ProgressRing, {
      props: { progress: 1, size: 200 },
    })
    const circle = wrapper.find('circle.progress')
    expect(circle.attributes('stroke-dashoffset')).toBe('0')
  })

  it('progress = 0.5 时,描边偏移为半周长', () => {
    const wrapper = mount(ProgressRing, {
      props: { progress: 0.5, size: 200 },
    })
    const circle = wrapper.find('circle.progress')
    expect(circle.attributes('stroke-dashoffset')).toBe('270')
  })

  it('支持 dashed prop(paused 状态)', () => {
    const wrapper = mount(ProgressRing, {
      props: { progress: 0.5, size: 200, dashed: true },
    })
    const circle = wrapper.find('circle.progress')
    expect(circle.attributes('stroke-dasharray')).toBe('2 6')
  })
})
