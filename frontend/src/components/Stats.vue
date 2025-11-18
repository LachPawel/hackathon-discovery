<template>
  <section class="stats">
    <div class="stats-container">
      <StatCard 
        :value="stats.total_projects" 
        label="Projects Tracked"
      />
      <StatCard 
        :value="stats.got_funding" 
        label="Got Funding"
      />
      <StatCard 
        :value="stats.became_startups" 
        label="Became Startups"
      />
      <StatCard 
        :value="stats.has_users" 
        label="Have Users"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import StatCard from './StatCard.vue'
import type { Stats } from '../types'

defineProps<{
  stats: Stats
}>()
</script>

<style scoped>
.stats {
  padding: 3rem 2rem;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.stats-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .stats {
    padding: 2rem 1rem;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
</style>

