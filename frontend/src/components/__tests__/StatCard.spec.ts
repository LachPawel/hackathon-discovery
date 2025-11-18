import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatCard from '../StatCard.vue'

describe('StatCard', () => {
  it('renders value and label correctly', () => {
    const wrapper = mount(StatCard, {
      props: {
        value: 42,
        label: 'Test Label'
      }
    })
    
    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('Test Label')
  })
  
  it('displays zero correctly', () => {
    const wrapper = mount(StatCard, {
      props: {
        value: 0,
        label: 'Zero Value'
      }
    })
    
    expect(wrapper.text()).toContain('0')
  })
})

