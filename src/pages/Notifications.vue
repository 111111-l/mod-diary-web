<template>
  <div class="page-container">
    <div class="page-header">
      <h1>通知</h1>
    </div>

    <div v-if="notifications.length === 0" class="empty-state">
      <div class="icon">🔔</div>
      <p>暂无通知</p>
    </div>

    <div v-else class="notification-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.read }"
        @click="markAsRead(notification)"
      >
        <div class="notification-icon">
          {{ getNotificationIcon(notification.type) }}
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-text">{{ notification.content }}</div>
          <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'Notifications',
  setup() {
    const notifications = ref([]);

    onMounted(() => {
      loadNotifications();
    });

    const loadNotifications = () => {
      notifications.value = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const getNotificationIcon = (type) => {
      const icons = {
        mood_alert: '⚠️',
        system: 'ℹ️',
        friend: '👥',
        class: '🏫'
      };
      return icons[type] || '🔔';
    };

    const formatTime = (timeStr) => {
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}天前`;
      if (hours > 0) return `${hours}小时前`;
      if (minutes > 0) return `${minutes}分钟前`;
      return '刚刚';
    };

    const markAsRead = (notification) => {
      notification.read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications.value));
    };

    return {
      notifications,
      getNotificationIcon,
      formatTime,
      markAsRead
    };
  }
};
</script>

<style scoped>
.notification-list {
  padding: 10px;
}

.notification-item {
  display: flex;
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.notification-item.unread {
  border-left: 3px solid #1989fa;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-icon {
  font-size: 28px;
  margin-right: 15px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}

.notification-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 5px;
}

.notification-time {
  font-size: 11px;
  color: #999;
}
</style>
