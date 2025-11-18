import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ProjectCard from '../ProjectCard.vue'
import type { Project } from '../../types'

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  tagline: 'A test project',
  hackathon_name: 'Test Hackathon',
  overall_score: 85
}

describe('ProjectCard', () => {
  it('renders project name and tagline', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: mockProject
      }
    })
    
    expect(wrapper.text()).toContain('Test Project')
    expect(wrapper.text()).toContain('A test project')
  })
  
  it('displays hackathon name', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: mockProject
      }
    })
    
    expect(wrapper.text()).toContain('Test Hackathon')
  })
  
  it('shows score when available', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: mockProject
      }
    })
    
    expect(wrapper.text()).toContain('Score: 85/100')
  })
  
  it('hides score when not available', () => {
    const projectWithoutScore = { ...mockProject, overall_score: undefined }
    const wrapper = mount(ProjectCard, {
      props: {
        project: projectWithoutScore
      }
    })
    
    expect(wrapper.text()).not.toContain('Score:')
  })
  it('renders initials placeholder when no image', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject }
    })
    expect(wrapper.find('.initials').text()).toBe('TP')
  })
  
  it('toggles sources modal', async () => {
    const wrapper = mount(ProjectCard, {
      props: { project: { ...mockProject, research_sources: ['https://example.com/news'] } }
    })
    
    expect(wrapper.find('.sources-modal').exists()).toBe(false)
    await wrapper.find('.sources-toggle').trigger('click')
    await nextTick()
    expect(wrapper.find('.sources-modal').exists()).toBe(true)
  })
})

