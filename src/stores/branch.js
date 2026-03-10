import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

export const useBranchStore = defineStore('branch', {
  state: () => ({
    branches: [],
    currentBranch: null,
    loading: false,
    error: null,
  }),

  getters: {
    currentBranchName: (state) => {
      return state.currentBranch?.name || 'Tawi Kuu'
    },
    currentBranchLocation: (state) => {
      return state.currentBranch?.location || ''
    },
  },

  actions: {
    async fetchBranches() {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_URL}/branches-list`)
        if (response.data.success) {
          this.branches = response.data.data || []

          // Load saved branch from localStorage or set default
          const savedBranchId = localStorage.getItem('selectedBranch')
          if (savedBranchId) {
            const savedBranch = this.branches.find((b) => b.id === parseInt(savedBranchId))
            if (savedBranch) {
              this.currentBranch = savedBranch
            } else if (this.branches.length > 0) {
              this.currentBranch = this.branches[0]
              localStorage.setItem('selectedBranch', this.branches[0].id)
            }
          } else if (this.branches.length > 0) {
            this.currentBranch = this.branches[0]
            localStorage.setItem('selectedBranch', this.branches[0].id)
          }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch branches'
        console.error('Error fetching branches:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createBranch(branchData) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post(`${API_URL}/branches`, branchData)
        if (response.data.success) {
          await this.fetchBranches() // Refresh branches list
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create branch'
        console.error('Error creating branch:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateBranch(id, branchData) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.put(`${API_URL}/branches/${id}`, branchData)
        if (response.data.success) {
          await this.fetchBranches() // Refresh branches list
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update branch'
        console.error('Error updating branch:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteBranch(id) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.delete(`${API_URL}/branches/${id}`)
        if (response.data.success) {
          await this.fetchBranches() // Refresh branches list

          // If current branch was deleted, select another one
          if (this.currentBranch?.id === id) {
            if (this.branches.length > 0) {
              this.setCurrentBranch(this.branches[0])
            } else {
              this.currentBranch = null
              localStorage.removeItem('selectedBranch')
            }
          }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete branch'
        console.error('Error deleting branch:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setCurrentBranch(branch) {
      this.currentBranch = branch
      if (branch) {
        localStorage.setItem('selectedBranch', branch.id)
      } else {
        localStorage.removeItem('selectedBranch')
      }
    },

    clearCurrentBranch() {
      this.currentBranch = null
      localStorage.removeItem('selectedBranch')
    },
  },
})
