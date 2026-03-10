// stores/system.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useSystemStore = defineStore('system', {
  state: () => ({
    stats: {
      storage: 0,
      users: 0,
      lastBackup: null
    },
    version: '1.0.0'
  }),

  actions: {
    async fetchSystemStats() {
      try {
        const response = await api.get('/system/stats')
        this.stats = response.data
      } catch (error) {
        console.error('Error fetching system stats:', error)
      }
    }
  }
})