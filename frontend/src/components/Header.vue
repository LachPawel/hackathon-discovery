<template>
  <header class="header">
    <div class="header-content">
      <h1 class="title">STARTUATE</h1>
      <p class="subtitle">Hackathon winners that became real startups</p>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.header {
  border-bottom: 1px solid var(--gray-200);
  padding: 3rem 2rem;
  background: var(--white);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--black);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-family: 'Inter', -apple-system, sans-serif;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--gray-600);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 400;
}

@media (max-width: 768px) {
  .header {
    padding: 2rem 1rem;
  }
  
  .title {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 0.75rem;
  }
}
</style>

