<template>
  <div class="stat-card">
    <div class="stat-value">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: number
  label: string
}>()
</script>

<style scoped>
.stat-card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  padding: 2rem 1.5rem;
  text-align: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--black);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--black);
  margin-bottom: 0.5rem;
  line-height: 1;
  font-family: 'Inter', -apple-system, sans-serif;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1.5rem 1rem;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}
</style>

