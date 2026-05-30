<template>
  <div class="page-container">
    <div class="page-header">
      <h1>我的</h1>
    </div>

    <div class="user-card">
      <div class="user-avatar">{{ userInfo?.nickname?.[0] || '👤' }}</div>
      <div class="user-info">
        <div class="user-name">{{ userInfo?.nickname || '未登录' }}</div>
        <span class="role-badge" :class="'role-' + userInfo?.role">
          {{ userInfo?.role === 'teacher' ? '教师' : '学生' }}
        </span>
      </div>
    </div>

    <div class="card mt-15">
      <div class="card-title">账号信息</div>
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">用户ID</span>
          <span class="info-value">{{ userInfo?.id || '-' }}</span>
        </div>
        <div class="info-item" v-if="userInfo?.className">
          <span class="info-label">所在班级</span>
          <span class="info-value">{{ userInfo.className }}</span>
        </div>
        <div class="info-item" v-if="userInfo?.classCode">
          <span class="info-label">班级邀请码</span>
          <span class="info-value">{{ userInfo.classCode }}</span>
        </div>
      </div>
    </div>

    <div v-if="userInfo?.role === 'student'" class="card mt-15">
      <div class="card-title">班级管理</div>
      <div v-if="userInfo.classId" class="class-status">
        <div class="class-info">
          <span class="class-name">{{ userInfo.className }}</span>
          <span class="class-code">邀请码: {{ userInfo.classCode }}</span>
        </div>
        <button class="btn btn-default" @click="goToClassManagement">班级管理</button>
      </div>
      <div v-else>
        <p class="text-muted mb-10">您还没有加入班级</p>
        <button class="btn btn-primary" @click="showJoinClass = true">加入班级</button>
      </div>
    </div>

    <div v-if="userInfo?.role === 'teacher'" class="card mt-15">
      <div class="card-title">班级管理</div>
      <div v-if="userInfo.classId" class="class-status">
        <div class="class-info">
          <span class="class-name">{{ userInfo.className }}</span>
          <span class="class-code">邀请码: {{ userInfo.classCode }}</span>
        </div>
        <button class="btn btn-primary" @click="goToClassManagement">管理班级</button>
      </div>
      <div v-else>
        <p class="text-muted mb-10">您还没有创建班级</p>
        <button class="btn btn-primary" @click="showCreateClass = true">创建班级</button>
      </div>
    </div>

    <div v-if="userInfo?.role === 'teacher' && alertNotifications.length > 0" class="card mt-15 alert-card">
      <div class="card-title">⚠️ 学生心情预警</div>
      <div
        v-for="alert in alertNotifications"
        :key="alert.id"
        class="alert-item"
      >
        <div class="alert-content">
          <div class="alert-student">{{ alert.studentName }}</div>
          <div class="alert-class">{{ alert.className }}</div>
          <div class="alert-reason">{{ alert.content }}</div>
          <div class="alert-time">{{ formatTime(alert.createdAt) }}</div>
        </div>
      </div>
    </div>

    <div class="card mt-15">
      <div class="card-title">通知</div>
      <button class="btn btn-default" @click="goToNotifications">查看通知</button>
    </div>

    <div class="card mt-15">
      <div class="card-title">操作</div>
      <button class="btn btn-default btn-block" @click="switchAccount">切换账号</button>
      <button class="btn btn-danger btn-block mt-10" @click="logout">退出登录</button>
    </div>

    <div v-if="showJoinClass" class="modal-overlay" @click.self="showJoinClass = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">加入班级</h3>
          <button class="modal-close" @click="showJoinClass = false">&times;</button>
        </div>
        <div class="form-group">
          <input
            type="text"
            class="input"
            v-model="joinCode"
            placeholder="请输入班级邀请码"
          />
        </div>
        <button class="btn btn-primary btn-block" @click="joinClass">加入</button>
      </div>
    </div>

    <div v-if="showCreateClass" class="modal-overlay" @click.self="showCreateClass = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">创建班级</h3>
          <button class="modal-close" @click="showCreateClass = false">&times;</button>
        </div>
        <div class="form-group">
          <input
            type="text"
            class="input"
            v-model="newClassName"
            placeholder="请输入班级名称"
          />
        </div>
        <button class="btn btn-primary btn-block" @click="createClass">创建</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'Mine',
  emits: ['navigate'],
  setup(props, { emit }) {
    const userInfo = ref(null);
    const showJoinClass = ref(false);
    const showCreateClass = ref(false);
    const joinCode = ref('');
    const newClassName = ref('');

    const alertNotifications = computed(() => {
      if (!userInfo.value || userInfo.value.role !== 'teacher') return [];

      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      return notifications.filter(n =>
        n.type === 'mood_alert' && n.classId === userInfo.value.classId
      );
    });

    onMounted(() => {
      userInfo.value = JSON.parse(localStorage.getItem('userInfo') || 'null');
    });

    const goToClassManagement = () => {
      emit('navigate', { page: 'ClassManagement', params: { classId: userInfo.value.classId } });
    };

    const goToNotifications = () => {
      emit('navigate', { page: 'Notifications' });
    };

    const joinClass = () => {
      if (!joinCode.value.trim()) {
        alert('请输入邀请码');
        return;
      }

      const classes = JSON.parse(localStorage.getItem('classes') || '[]');
      const cls = classes.find(c => c.code === joinCode.value.toUpperCase());

      if (!cls) {
        alert('班级不存在');
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === userInfo.value.id);

      if (userIndex >= 0) {
        users[userIndex].classId = cls.id;
        users[userIndex].className = cls.name;
        users[userIndex].classCode = cls.code;

        if (!cls.students.includes(userInfo.value.id)) {
          cls.students.push(userInfo.value.id);
          cls.studentCount = cls.students.length;
        }

        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('classes', JSON.stringify(classes));

        userInfo.value = users[userIndex];
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
      }

      showJoinClass.value = false;
      alert('加入成功！');
    };

    const createClass = () => {
      if (!newClassName.value.trim()) {
        alert('请输入班级名称');
        return;
      }

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const cls = {
        id: Date.now().toString(),
        name: newClassName.value,
        code: code,
        teacherId: userInfo.value.id,
        teacherName: userInfo.value.nickname,
        createdAt: new Date().toISOString(),
        studentCount: 0,
        students: []
      };

      const classes = JSON.parse(localStorage.getItem('classes') || '[]');
      classes.push(cls);
      localStorage.setItem('classes', JSON.stringify(classes));

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === userInfo.value.id);

      if (userIndex >= 0) {
        users[userIndex].classId = cls.id;
        users[userIndex].className = cls.name;
        users[userIndex].classCode = cls.code;

        localStorage.setItem('users', JSON.stringify(users));

        userInfo.value = users[userIndex];
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
      }

      showCreateClass.value = false;
      newClassName.value = '';
      alert(`创建成功！班级邀请码: ${code}`);
    };

    const switchAccount = () => {
      localStorage.removeItem('userInfo');
      emit('navigate', { page: 'Login' });
    };

    const logout = () => {
      if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('userInfo');
        emit('navigate', { page: 'Login' });
      }
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
      showJoinClass,
      showCreateClass,
      joinCode,
      newClassName,
      alertNotifications,
      goToClassManagement,
      goToNotifications,
      joinClass,
      createClass,
      switchAccount,
      logout,
      formatTime
    };
  }
};
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  margin-right: 15px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.class-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-info {
  flex: 1;
}

.class-name {
  font-size: 16px;
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.class-code {
  font-size: 12px;
  color: #999;
}

.alert-card {
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.alert-item {
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  margin-top: 10px;
}

.alert-student {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.alert-class {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.alert-reason {
  font-size: 13px;
  color: #ff4d4f;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 11px;
  color: #999;
}
</style>
