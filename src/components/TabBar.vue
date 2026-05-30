<template>
  <div class="tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-item"
      :class="{ active: active === tab.id }"
      @click="$emit('change', tab.id)"
    >
      <div class="icon">{{ tab.icon }}</div>
      <span>{{ tab.text }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    active: {
      type: String,
      default: 'index'
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const tabs = [
      { id: 'index', text: '首页', icon: '🏠' },
      { id: 'discover', text: '发现', icon: '🔍' },
      { id: 'friend', text: '朋友', icon: '👥' },
      { id: 'mine', text: '我的', icon: '👤' }
    ];

    return { tabs };
  }
};
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #e5e5e5;
  z-index: 1000;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px 15px;
  color: #7a7e83;
  cursor: pointer;
  transition: color 0.2s;
}

.tab-item.active {
  color: #1989fa;
}

.tab-item .icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.tab-item span {
  display: block;
  font-size: 12px;
}
</style>
