<template>
  <div id="app">
    <component :is="currentPage" @navigate="handleNavigate" />
    <TabBar v-if="userInfo && currentPage !== 'Login'" :active="currentTab" @change="handleTabChange" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import TabBar from './components/TabBar.vue';
import Login from './pages/Login.vue';
import Index from './pages/Index.vue';
import Discover from './pages/Discover.vue';
import Friend from './pages/Friend.vue';
import Mine from './pages/Mine.vue';
import ClassManagement from './pages/ClassManagement.vue';
import History from './pages/History.vue';
import Notifications from './pages/Notifications.vue';
import Chat from './pages/Chat.vue';
import Edit from './pages/Edit.vue';

export default {
  name: 'App',
  components: {
    TabBar
  },
  setup() {
    const userInfo = ref(null);
    const currentPage = ref('Login');
    const currentTab = ref('index');

    const pages = {
      Login,
      Index,
      Discover,
      Friend,
      Mine,
      ClassManagement,
      History,
      Notifications,
      Chat,
      Edit
    };

    onMounted(() => {
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        userInfo.value = JSON.parse(stored);
        currentPage.value = 'Index';
        currentTab.value = 'index';
      } else {
        currentPage.value = 'Login';
      }
    });

    const handleNavigate = ({ page, params = {} }) => {
      currentPage.value = page;
      if (params.classId) {
        localStorage.setItem('currentClassId', params.classId);
      }
    };

    const handleTabChange = (tab) => {
      currentTab.value = tab;
      const pageMap = {
        index: 'Index',
        discover: 'Discover',
        friend: 'Friend',
        mine: 'Mine'
      };
      currentPage.value = pageMap[tab] || 'Index';
    };

    const setUserInfo = (info) => {
      userInfo.value = info;
      localStorage.setItem('userInfo', JSON.stringify(info));
      currentPage.value = 'Index';
      currentTab.value = 'index';
    };

    const logout = () => {
      userInfo.value = null;
      localStorage.removeItem('userInfo');
      currentPage.value = 'Login';
    };

    return {
      userInfo,
      currentPage: computed(() => pages[currentPage.value]),
      currentTab,
      handleNavigate,
      handleTabChange
    };
  },
  provide() {
    return {
      userInfo: this.userInfo,
      setUserInfo: this.setUserInfo,
      logout: this.logout
    };
  }
};
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}
</style>
