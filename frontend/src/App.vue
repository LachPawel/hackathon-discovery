<template>
  <div class="app">
    <Header />
    <Stats :stats="stats" v-if="stats" />
    <Tabs :active-tab="activeTab" @tab-change="handleTabChange" />
    <ProjectGrid 
      :projects="displayProjects" 
      :loading="loading"
      @refresh="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Header from './components/Header.vue'
import Stats from './components/Stats.vue'
import Tabs from './components/Tabs.vue'
import ProjectGrid from './components/ProjectGrid.vue'
import { fetchProjects, fetchLeaderboard, fetchSuccessStories, fetchStats } from './services/api'
import type { Project, Stats as StatsType } from './types'

const activeTab = ref<'all' | 'leaderboard' | 'success'>('all')
const projects = ref<Project[]>([])
const leaderboard = ref<Project[]>([])
const successStories = ref<Project[]>([])
const stats = ref<StatsType | null>(null)
const loading = ref(true)

const displayProjects = computed(() => {
  if (activeTab.value === 'leaderboard') return leaderboard.value
  if (activeTab.value === 'success') return successStories.value
  return projects.value
})

const handleTabChange = (tab: 'all' | 'leaderboard' | 'success') => {
  activeTab.value = tab
}

const loadData = async () => {
  loading.value = true
  try {
    const [projectsData, leaderboardData, successData, statsData] = await Promise.all([
      fetchProjects(),
      fetchLeaderboard(),
      fetchSuccessStories(),
      fetchStats()
    ])
    
    projects.value = projectsData
    leaderboard.value = leaderboardData
    successStories.value = successData
    stats.value = statsData
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--white);
}
</style>

