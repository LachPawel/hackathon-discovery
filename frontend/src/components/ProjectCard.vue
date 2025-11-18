<template>
  <article class="project-card">
    <div v-if="project.image_url" class="image-container">
      <img :src="project.image_url" :alt="project.name" class="image" />
    </div>
    <div v-else class="image-placeholder">
      <span class="initials">{{ initials }}</span>
    </div>
    
    <div class="content">
      <h3 class="name">{{ project.name }}</h3>
      <p class="tagline">{{ project.tagline || 'No description available' }}</p>
      
      <div class="meta">
        <span class="badge">{{ project.hackathon_name }}</span>
        <span v-if="project.prize" class="badge">{{ project.prize }}</span>
        <span v-if="project.got_funding" class="badge badge-funded">Funded</span>
        <span v-if="project.became_startup" class="badge badge-startup">Startup</span>
      </div>
      
      <div v-if="project.overall_score !== null && project.overall_score !== undefined" class="score">
        <div class="score-label">Score: {{ project.overall_score }}/100</div>
        <div class="score-bar">
          <div class="score-fill" :style="{ width: `${project.overall_score}%` }"></div>
        </div>
      </div>
      
      <div v-if="project.research_summary" class="summary">
        <div class="summary-text" v-html="formatSummary(project.research_summary)"></div>
      </div>
      
      <div v-if="project.research_sources?.length" class="sources-wrapper">
        <button class="sources-toggle" type="button" @click="toggleSources">
          {{ showSources ? 'Hide Sources' : 'Sources' }}
        </button>
      </div>
      
      <transition name="modal">
        <div v-if="showSources" class="sources-modal" @click.self="toggleSources">
          <div class="sources-modal-content">
            <div class="sources-header">
              <span>Sources ({{ project.research_sources.length }})</span>
              <button class="close-btn" type="button" @click="toggleSources">×</button>
            </div>
            <ul class="sources-list">
              <li v-for="source in project.research_sources" :key="source">
                <a :href="source" target="_blank" rel="noopener noreferrer">
                  {{ formatSourceLabel(source) }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </transition>
      
      <div class="links">
        <a
          v-if="project.devpost_url"
          :href="project.devpost_url"
          target="_blank"
          rel="noopener noreferrer"
          class="link"
        >
          View Project
        </a>
        <a
          v-if="project.github_url"
          :href="project.github_url"
          target="_blank"
          rel="noopener noreferrer"
          class="link link-secondary"
        >
          GitHub
        </a>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import type { Project } from '../types'

const props = defineProps<{
  project: Project
}>()

const project = toRef(props, 'project')

const showSources = ref(false)

const toggleSources = () => {
  showSources.value = !showSources.value
}

const initials = computed(() => {
  const name = project.value?.name || ''
  const words = name.split(/\s+/).filter(Boolean)
  if (!words.length) return '??'
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
})

const formatSummary = (summary: string): string => {
  if (!summary) return ''
  // Convert newlines to breaks and preserve structure
  return summary
    .split('\n\n')
    .map(para => {
      if (para.trim()) {
        return `<p>${para.trim().replace(/\n/g, '<br>')}</p>`
      }
      return ''
    })
    .join('')
}

const formatSourceLabel = (url: string): string => {
  try {
    const { hostname, pathname } = new URL(url)
    const domain = hostname.replace(/^www\./, '')
    const path = pathname.replace(/\/$/, '')
    return path ? `${domain}${path}` : domain
  } catch {
    return url
  }
}
</script>

<style scoped>
.project-card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.project-card:hover {
  border-color: var(--black);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--gray-100);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 200px;
  background: var(--gray-100);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
}

.initials {
  font-size: 2rem;
  font-weight: 600;
  color: var(--gray-400);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--black);
  line-height: 1.3;
  margin: 0;
}

.tagline {
  font-size: 0.875rem;
  color: var(--gray-600);
  line-height: 1.5;
  margin: 0;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
}

.badge-funded {
  background: var(--black);
  color: var(--white);
  border-color: var(--black);
}

.badge-startup {
  background: var(--white);
  color: var(--black);
  border-color: var(--black);
}

.score {
  margin-top: 0.5rem;
}

.score-label {
  font-size: 0.75rem;
  color: var(--gray-600);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-bar {
  width: 100%;
  height: 4px;
  background: var(--gray-200);
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: var(--black);
  transition: width 0.3s ease;
}

.summary {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.summary-text {
  font-size: 0.875rem;
  color: var(--gray-700);
  line-height: 1.6;
}

.summary-text :deep(strong) {
  color: var(--black);
  font-weight: 600;
}

.summary-text :deep(p) {
  margin: 0.5rem 0;
}

.sources-wrapper {
  border-top: 1px solid var(--gray-200);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.sources-toggle {
  width: 100%;
  background: transparent;
  border: 1px solid var(--gray-200);
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.7rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.sources-toggle:hover {
  border-color: var(--black);
  color: var(--black);
}

.sources-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1000;
}

.sources-modal-content {
  background: var(--white);
  width: min(480px, 90vw);
  max-height: 80vh;
  border: 1px solid var(--black);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.sources-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-600);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--gray-500);
}

.sources-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.sources-list a {
  font-size: 0.85rem;
  color: var(--black);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
  word-break: break-all;
}

.sources-list a:hover {
  border-color: var(--black);
}

.sources-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.sources-list a {
  font-size: 0.8rem;
  color: var(--black);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
  word-break: break-all;
}

.sources-list a:hover {
  border-color: var(--black);
}

.links {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.link {
  flex: 1;
  padding: 0.75rem 1rem;
  text-align: center;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  border: 1px solid var(--black);
  background: var(--black);
  color: var(--white);
}

.link:hover {
  background: var(--gray-800);
}

.link-secondary {
  background: var(--white);
  color: var(--black);
}

.link-secondary:hover {
  background: var(--gray-50);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 768px) {
  .content {
    padding: 1.25rem;
  }
  
  .name {
    font-size: 1.125rem;
  }
}
</style>

