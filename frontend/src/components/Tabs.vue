<template>
  <nav class="tabs">
    <div class="tabs-container">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="$emit('tab-change', tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  activeTab: 'all' | 'leaderboard' | 'success'
}>()

defineEmits<{
  (e: 'tab-change', tab: 'all' | 'leaderboard' | 'success'): void
}>()

const tabs = ref([
  { id: 'all' as const, label: 'All Projects' },
  { id: 'leaderboard' as const, label: 'Leaderboard' },
  { id: 'success' as const, label: 'Success Stories' }
])
</script>

<style scoped>
.tabs {
  padding: 0 2rem;
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
}

.tabs-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
  padding: 1.5rem 0;
}

.tab {
  background: transparent;
  border: 1px solid var(--gray-200);
  color: var(--gray-600);
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, sans-serif;
}

.tab:hover {
  border-color: var(--black);
  color: var(--black);
}

.tab.active {
  background: var(--black);
  color: var(--white);
  border-color: var(--black);
}

@media (max-width: 768px) {
  .tabs {
    padding: 0 1rem;
  }
  
  .tabs-container {
    gap: 0.25rem;
    padding: 1rem 0;
  }
  
  .tab {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    flex: 1;
  }
}
</style>

