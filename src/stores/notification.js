// stores/notification.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0
  }),

  actions: {
    async fetchNotifications() {
      try {
        const response = await api.get('/notifications')
        this.notifications = response.data
        this.updateUnreadCount()
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    },

    async markAsRead(id) {
      try {
        await api.patch(`/notifications/${id}/read`)
        const notification = this.notifications.find(n => n.id === id)
        if (notification) {
          notification.read = true
        }
        this.updateUnreadCount()
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    },

    async markAllAsRead() {
      try {
        await api.patch('/notifications/read-all')
        this.notifications.forEach(n => n.read = true)
        this.unreadCount = 0
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
      }
    },

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length
    },

    addNotification(notification) {
      this.notifications.unshift(notification)
      this.updateUnreadCount()
    }
  }
})