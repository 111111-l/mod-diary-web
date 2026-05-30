<template>
  <div class="login-page">
    <div class="login-header">
      <h1>每日一记</h1>
      <p class="subtitle">记录生活 · 分析心情 · 守护健康</p>
    </div>

    <div class="login-content">
      <div v-if="!showIdentityModal" class="login-form">
        <div class="role-select">
          <div
            class="role-option"
            :class="{ active: role === 'student' }"
            @click="selectRole('student')"
          >
            <div class="role-icon">👨‍🎓</div>
            <div class="role-text">我是学生</div>
          </div>
          <div
            class="role-option"
            :class="{ active: role === 'teacher' }"
            @click="selectRole('teacher')"
          >
            <div class="role-icon">👨‍🏫</div>
            <div class="role-text">我是老师</div>
          </div>
        </div>

        <div class="form-group">
          <input
            type="text"
            class="input"
            v-model="nickname"
            placeholder="请输入昵称"
            @input="handleNicknameInput"
          />
        </div>

        <div v-if="role === 'teacher'" class="form-group">
          <input
            type="text"
            class="input"
            v-model="className"
            placeholder="请输入班级名称（可选）"
          />
          <button class="btn btn-primary mt-10" @click="createClass" :disabled="!className || creating">
            {{ creating ? '创建中...' : '创建班级' }}
          </button>
          <div v-if="classCode" class="class-info mt-15">
            <p class="text-success">班级创建成功！</p>
            <p>班级名称：{{ className }}</p>
            <p>邀请码：<strong>{{ classCode }}</strong></p>
          </div>
        </div>

        <div v-if="role === 'student'" class="form-group">
          <input
            type="text"
            class="input"
            v-model="joinClassCode"
            placeholder="请输入班级邀请码（可选）"
          />
        </div>

        <button class="btn btn-primary btn-block mt-15" @click="doLogin">
          开始使用
        </button>

        <div v-if="existingUsers.length > 0" class="existing-accounts mt-20">
          <div class="divider">
            <span>或选择已有账号</span>
          </div>
          <div
            v-for="(user, index) in existingUsers"
            :key="index"
            class="account-item"
            @click="selectExistingAccount(index)"
          >
            <img :src="user.avatar" class="avatar" />
            <div class="account-info">
              <div class="account-name">{{ user.nickname }}</div>
              <span class="role-badge" :class="'role-' + user.role">
                {{ user.role === 'teacher' ? '教师' : '学生' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="identity-modal">
        <div class="modal-header">
          <h3>选择身份</h3>
        </div>
        <p class="text-muted mb-15">检测到您有多个身份，请选择要使用的身份：</p>
        <div
          v-for="(identity, index) in identities"
          :key="index"
          class="identity-item"
          @click="loginWithIdentity(index)"
        >
          <img :src="identity.avatar" class="avatar" />
          <div class="identity-info">
            <div class="identity-name">{{ identity.nickname }}</div>
            <span class="role-badge" :class="'role-' + identity.role">
              {{ identity.role === 'teacher' ? '教师' : '学生' }}
            </span>
            <span v-if="identity.className" class="class-name">{{ identity.className }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'Login',
  emits: ['navigate'],
  setup(props, { emit }) {
    const nickname = ref('');
    const role = ref('');
    const className = ref('');
    const joinClassCode = ref('');
    const classCode = ref('');
    const classId = ref('');
    const creating = ref(false);
    const existingUsers = ref([]);
    const showIdentityModal = ref(false);
    const identities = ref([]);

    onMounted(() => {
      loadExistingUsers();
    });

    const loadExistingUsers = () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      existingUsers.value = users;
    };

    const selectRole = (r) => {
      role.value = r;
      classCode.value = '';
      classId.value = '';
      joinClassCode.value = '';
    };

    const handleNicknameInput = (e) => {
      nickname.value = e.target.value.trim();
    };

    const createClass = async () => {
      if (!className.value) return;

      creating.value = true;

      await new Promise(resolve => setTimeout(resolve, 500));

      const code = generateClassCode();
      classCode.value = code;

      const classData = {
        id: generateId(),
        name: className.value,
        code: code,
        createdAt: new Date().toISOString(),
        studentCount: 0,
        students: []
      };

      const classes = JSON.parse(localStorage.getItem('classes') || '[]');
      classes.push(classData);
      localStorage.setItem('classes', JSON.stringify(classes));

      creating.value = false;
    };

    const generateClassCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const generateId = () => {
      return Math.random().toString(36).substring(2, 10);
    };

    const doLogin = () => {
      if (!nickname.value) {
        alert('请输入昵称');
        return;
      }

      if (!role.value) {
        alert('请选择身份');
        return;
      }

      const userId = generateId();
      const userData = {
        id: userId,
        nickname: nickname.value,
        avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">👤</text></svg>',
        role: role.value,
        classCode: classCode.value || joinClassCode.value || '',
        classId: classId.value || '',
        className: className.value || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingIndex = users.findIndex(u => u.id === userId);
      if (existingIndex >= 0) {
        users[existingIndex] = userData;
      } else {
        users.push(userData);
      }

      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('userInfo', JSON.stringify(userData));

      if (userData.role === 'student' && joinClassCode.value) {
        joinClass(joinClassCode.value, userId);
      }

      emit('navigate', { page: 'Index' });
    };

    const joinClass = (code, userId) => {
      const classes = JSON.parse(localStorage.getItem('classes') || '[]');
      const cls = classes.find(c => c.code === code);

      if (cls) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex >= 0) {
          users[userIndex].classId = cls.id;
          users[userIndex].className = cls.name;
          users[userIndex].classCode = cls.code;

          if (!cls.students.includes(userId)) {
            cls.students.push(userId);
            cls.studentCount = cls.students.length;
          }

          localStorage.setItem('users', JSON.stringify(users));
          localStorage.setItem('classes', JSON.stringify(classes));
        }
      }
    };

    const selectExistingAccount = (index) => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users[index];

      if (user) {
        user.lastLoginAt = new Date().toISOString();
        localStorage.setItem('userInfo', JSON.stringify(user));
        emit('navigate', { page: 'Index' });
      }
    };

    const loginWithIdentity = (index) => {
      const identity = identities.value[index];
      if (identity && identity.cloudUser) {
        const userData = { ...identity.cloudUser };
        userData.lastLoginAt = new Date().toISOString();
        localStorage.setItem('userInfo', JSON.stringify(userData));
        showIdentityModal.value = false;
        emit('navigate', { page: 'Index' });
      }
    };

    return {
      nickname,
      role,
      className,
      joinClassCode,
      classCode,
      creating,
      existingUsers,
      showIdentityModal,
      identities,
      selectRole,
      handleNicknameInput,
      createClass,
      doLogin,
      selectExistingAccount,
      loginWithIdentity
    };
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.login-header {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.login-content {
  max-width: 400px;
  margin: 0 auto;
}

.login-form {
  background: #fff;
  border-radius: 12px;
  padding: 30px 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.role-select {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.role-option {
  flex: 1;
  padding: 20px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.role-option:hover {
  border-color: #1989fa;
}

.role-option.active {
  border-color: #1989fa;
  background: #e6f7ff;
}

.role-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.role-text {
  font-size: 14px;
  color: #333;
}

.btn-block {
  width: 100%;
  display: block;
}

.class-info {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.class-info p {
  margin: 5px 0;
  font-size: 14px;
}

.existing-accounts {
  margin-top: 20px;
}

.divider {
  text-align: center;
  position: relative;
  margin: 20px 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: #e5e5e5;
}

.divider span {
  position: relative;
  background: #fff;
  padding: 0 15px;
  color: #999;
  font-size: 12px;
}

.account-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.account-item:hover {
  background: #fafafa;
  border-color: #1989fa;
}

.account-item .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.identity-modal {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.identity-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
}

.identity-item:hover {
  background: #fafafa;
}

.identity-item .avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.identity-info {
  flex: 1;
}

.identity-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.class-name {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
}
</style>
