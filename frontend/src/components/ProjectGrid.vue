<template>
  <main class="project-grid-section">
    <div class="container">
      <div v-if="loading" class="loading">
        <div class="loading-text">Loading projects...</div>
      </div>
      
      <div v-else-if="projects.length === 0" class="empty">
        <div class="empty-text">No projects found</div>
        <button @click="$emit('refresh')" class="refresh-btn">Refresh</button>
      </div>
      
      <div v-else class="grid">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import ProjectCard from './ProjectCard.vue'
import type { Project } from '../types'

defineProps<{
  projects: Project[]
  loading: boolean
}>()

defineEmits<{
  (e: 'refresh'): void
}>()
</script>

<style scoped>
.project-grid-section {
  padding: 3rem 2rem;
  min-height: 60vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 2rem;
}

.loading,
.empty {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-text,
.empty-text {
  font-size: 1rem;
  color: var(--gray-600);
  margin-bottom: 1rem;
}

.refresh-btn {
  background: var(--black);
  color: var(--white);
  border: none;
  padding: 0.75rem 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: var(--gray-800);
}

@media (max-width: 768px) {
  .project-grid-section {
    padding: 2rem 1rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>

