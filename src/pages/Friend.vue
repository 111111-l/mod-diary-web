<template>
  <div class="page-container">
    <div class="page-header">
      <h1>朋友</h1>
    </div>

    <div class="card">
      <div class="card-title">好友列表</div>
      <div v-if="friends.length === 0" class="empty-state">
        <div class="icon">👥</div>
        <p>还没有好友</p>
        <button class="btn btn-primary mt-15" @click="showAddFriend = true">添加好友</button>
      </div>
      <div v-else class="friend-list">
        <div
          v-for="friend in friends"
          :key="friend.id"
          class="friend-item"
          @click="chatWithFriend(friend)"
        >
          <div class="friend-avatar">{{ friend.nickname[0] }}</div>
          <div class="friend-info">
            <div class="friend-name">{{ friend.nickname }}</div>
            <div class="friend-role">
              <span class="role-badge" :class="'role-' + friend.role">
                {{ friend.role === 'teacher' ? '老师' : '学生' }}
              </span>
              <span v-if="friend.className" class="class-name">{{ friend.className }}</span>
            </div>
          </div>
          <div v-if="friend.unread" class="unread-badge">{{ friend.unread }}</div>
        </div>
      </div>
    </div>

    <div v-if="userInfo && userInfo.role === 'student'" class="card mt-15">
      <div class="card-title">预警消息</div>
      <div v-if="alerts.length === 0" class="empty-state">
        <div class="icon">🔔</div>
        <p>暂无预警消息</p>
      </div>
      <div v-else class="alert-list">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="alert-item"
          :class="{ unread: !alert.read }"
          @click="viewAlert(alert)"
        >
          <div class="alert-icon">⚠️</div>
          <div class="alert-content">
            <div class="alert-title">{{ alert.title }}</div>
            <div class="alert-text">{{ alert.content }}</div>
            <div class="alert-time">{{ formatTime(alert.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <button class="fab" @click="showAddFriend = true">+</button>

    <div v-if="showAddFriend" class="modal-overlay" @click.self="showAddFriend = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">添加好友</h3>
          <button class="modal-close" @click="showAddFriend = false">&times;</button>
        </div>
        <div class="form-group">
          <input
            type="text"
            class="input"
            v-model="friendNickname"
            placeholder="输入好友昵称"
          />
        </div>
        <button class="btn btn-primary btn-block" @click="addFriend">发送请求</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'Friend',
  emits: ['navigate'],
  setup(props, { emit }) {
    const userInfo = ref(null);
    const friends = ref([]);
    const alerts = ref([]);
    const showAddFriend = ref(false);
    const friendNickname = ref('');

    onMounted(() => {
      loadData();
    });

    const loadData = () => {
      userInfo.value = JSON.parse(localStorage.getItem('userInfo') || 'null');
      friends.value = JSON.parse(localStorage.getItem('friends') || '[]');

      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      alerts.value = notifications.filter(n => n.type === 'mood_alert' && !n.read);
    };

    const chatWithFriend = (friend) => {
      emit('navigate', { page: 'Chat', params: { friendId: friend.id } });
    };

    const addFriend = () => {
      if (!friendNickname.value.trim()) {
        alert('请输入好友昵称');
        return;
      }

      const newFriend = {
        id: Date.now().toString(),
        nickname: friendNickname.value,
        role: 'student',
        avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">👤</text></svg>',
        createdAt: new Date().toISOString(),
        unread: 0
      };

      const allFriends = JSON.parse(localStorage.getItem('friends') || '[]');
      allFriends.push(newFriend);
      localStorage.setItem('friends', JSON.stringify(allFriends));

      friends.value = allFriends;
      friendNickname.value = '';
      showAddFriend.value = false;
    };

    const viewAlert = (alert) => {
      alert.read = true;
      localStorage.setItem('notifications', JSON.stringify(
        JSON.parse(localStorage.getItem('notifications') || '[]').map(n =>
          n.id === alert.id ? { ...n, read: true } : n
        )
      ));
      alerts.value = alerts.value.filter(a => a.id !== alert.id);
    };

    const formatTime = (timeStr) => {
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}天前`;
      if (hours > 0) return `${hours}小时前`;
      return '刚刚';
    };

    return {
      userInfo,
      friends,
      alerts,
      showAddFriend,
      friendNickname,
      chatWithFriend,
      addFriend,
      viewAlert,
      formatTime
    };
  }
};
</script>

<style scoped>
.friend-list, .alert-list {
  display: flex;
  flex-direction: column;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.friend-item:last-child {
  border-bottom: none;
}

.friend-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  margin-right: 12px;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.friend-role {
  display: flex;
  align-items: center;
  gap: 8px;
}

.class-name {
  font-size: 12px;
  color: #999;
}

.unread-badge {
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.alert-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-item.unread {
  background: #fff7e6;
  margin: 0 -15px;
  padding: 12px 15px;
}

.alert-icon {
  font-size: 24px;
  margin-right: 12px;
}

.alert-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.alert-text {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 11px;
  color: #999;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 70px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #1989fa;
  color: #fff;
  font-size: 30px;
  border: none;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
