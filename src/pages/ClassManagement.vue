<template>
  <div class="page-container">
    <div class="page-header">
      <h1>班级管理</h1>
      <p class="text-muted">{{ classInfo?.name || '加载中...' }}</p>
    </div>

    <div class="card">
      <div class="card-title">班级信息</div>
      <div class="class-detail">
        <div class="detail-item">
          <span class="detail-label">班级名称</span>
          <span class="detail-value">{{ classInfo?.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">邀请码</span>
          <span class="detail-value highlight">{{ classInfo?.code }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">学生数量</span>
          <span class="detail-value">{{ students.length }}人</span>
        </div>
        <div class="detail-item" v-if="isTeacher">
          <span class="detail-label">创建时间</span>
          <span class="detail-value">{{ formatDate(classInfo?.createdAt) }}</span>
        </div>
      </div>
      <button class="btn btn-default mt-15" @click="copyCode">
        复制邀请码
      </button>
    </div>

    <div class="card mt-15">
      <div class="card-title">学生列表</div>
      <div v-if="students.length === 0" class="empty-state">
        <div class="icon">👨‍🎓</div>
        <p>暂无学生</p>
      </div>
      <div v-else class="student-list">
        <div
          v-for="student in students"
          :key="student.id"
          class="student-item"
        >
          <div class="student-avatar">{{ student.nickname?.[0] || '👤' }}</div>
          <div class="student-info">
            <div class="student-name">{{ student.nickname }}</div>
            <div class="student-meta">
              <span v-if="student.lastMood">
                最近心情: {{ student.lastMood }}
              </span>
            </div>
          </div>
          <span
            v-if="student.moodStatus"
            class="mood-indicator"
            :class="'mood-' + student.moodStatus"
          >
            {{ student.moodStatus === 'good' ? '😊' : student.moodStatus === 'bad' ? '😟' : '😐' }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="isTeacher && alertStudents.length > 0" class="card mt-15 alert-card">
      <div class="card-title">⚠️ 需要关注的学生</div>
      <div class="alert-list">
        <div
          v-for="student in alertStudents"
          :key="student.id"
          class="alert-student"
        >
          <span class="alert-icon">⚠️</span>
          <span class="alert-name">{{ student.nickname }}</span>
          <span class="alert-reason">连续心情低落</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'ClassManagement',
  setup() {
    const classInfo = ref(null);
    const students = ref([]);
    const alertStudents = ref([]);
    const userInfo = ref(null);
    const isTeacher = computed(() => userInfo.value?.role === 'teacher');

    onMounted(() => {
      loadData();
    });

    const loadData = () => {
      userInfo.value = JSON.parse(localStorage.getItem('userInfo') || 'null');
      const classId = localStorage.getItem('currentClassId') || userInfo.value?.classId;

      const classes = JSON.parse(localStorage.getItem('classes') || '[]');
      classInfo.value = classes.find(c => c.id === classId);

      if (classInfo.value && classInfo.value.students) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        students.value = classInfo.value.students
          .map(id => users.find(u => u.id === id))
          .filter(Boolean)
          .map(s => ({
            ...s,
            lastMood: getLastMood(s.id),
            moodStatus: getMoodStatus(s.id)
          }));

        alertStudents.value = students.value.filter(s => s.moodStatus === 'bad');
      }
    };

    const getLastMood = (userId) => {
      const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
      const userMood = history.filter(h => h.id === userId);
      if (userMood.length === 0) return null;
      const last = userMood[userMood.length - 1];
      return last ? `分数${last.score}` : null;
    };

    const getMoodStatus = (userId) => {
      const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
      const last5 = history.slice(-5);
      if (last5.length < 5) return null;

      const allLow = last5.every(h => h.score < 15);
      const allHigh = last5.every(h => h.score >= 18);

      if (allLow) return 'bad';
      if (allHigh) return 'good';
      return null;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    };

    const copyCode = () => {
      if (classInfo.value?.code) {
        navigator.clipboard.writeText(classInfo.value.code);
        alert('邀请码已复制！');
      }
    };

    return {
      classInfo,
      students,
      alertStudents,
      isTeacher,
      formatDate,
      copyCode
    };
  }
};
</script>

<style scoped>
.class-detail {
  display: flex;
  flex-direction: column;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 500;
}

.detail-value.highlight {
  color: #1989fa;
  font-size: 16px;
}

.student-list {
  display: flex;
  flex-direction: column;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.student-item:last-child {
  border-bottom: none;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  margin-right: 12px;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.student-meta {
  font-size: 12px;
  color: #999;
}

.mood-indicator {
  font-size: 20px;
}

.alert-card {
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-student {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}

.alert-icon {
  font-size: 18px;
  margin-right: 10px;
}

.alert-name {
  flex: 1;
  font-weight: 500;
}

.alert-reason {
  font-size: 12px;
  color: #fa8c16;
}
</style>
