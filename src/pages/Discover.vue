<template>
  <div class="page-container">
    <div class="page-header">
      <h1>发现</h1>
    </div>

    <div class="card">
      <div class="card-title">🎮 休闲游戏</div>
      <div class="game-list">
        <div
          v-for="game in games"
          :key="game.id"
          class="game-item"
          @click="playGame(game)"
        >
          <div class="game-icon">{{ game.icon }}</div>
          <div class="game-info">
            <div class="game-name">{{ game.name }}</div>
            <div class="game-desc">{{ game.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentGame" class="game-container">
      <div class="game-header">
        <button class="btn btn-default" @click="closeGame">返回</button>
        <h3>{{ currentGame.name }}</h3>
      </div>
      <component :is="currentGame.component" @score="handleScore" />
    </div>

    <div class="card mt-15">
      <div class="card-title">📊 心情数据</div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ moodStats.totalDays }}</div>
          <div class="stat-label">记录天数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ moodStats.avgScore }}</div>
          <div class="stat-label">平均分数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value stat-good">{{ moodStats.goodDays }}</div>
          <div class="stat-label">开心天数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value stat-bad">{{ moodStats.badDays }}</div>
          <div class="stat-label">低落天数</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import SnowGame from '../components/games/SnowGame.vue';

export default {
  name: 'Discover',
  setup() {
    const currentGame = ref(null);
    const moodHistory = ref([]);

    const games = [
      {
        id: 'snow',
        name: '接雪花',
        desc: '点击收集雪花，看看能得多少分',
        icon: '❄️',
        component: SnowGame
      },
      {
        id: '2048',
        name: '2048',
        desc: '经典数字合并游戏',
        icon: '🔢',
        component: null
      },
      {
        id: 'marble',
        name: '弹珠游戏',
        desc: '消除相同颜色的弹珠',
        icon: '🎱',
        component: null
      }
    ];

    const moodStats = computed(() => {
      const history = moodHistory.value;
      if (history.length === 0) {
        return { totalDays: 0, avgScore: 0, goodDays: 0, badDays: 0 };
      }

      const totalScore = history.reduce((sum, h) => sum + h.score, 0);
      const avgScore = (totalScore / history.length).toFixed(1);
      const goodDays = history.filter(h => h.score >= 18).length;
      const badDays = history.filter(h => h.score < 12).length;

      return {
        totalDays: history.length,
        avgScore,
        goodDays,
        badDays
      };
    });

    onMounted(() => {
      moodHistory.value = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    });

    const playGame = (game) => {
      if (game.component) {
        currentGame.value = game;
      } else {
        alert(`${game.name} 正在开发中...`);
      }
    };

    const closeGame = () => {
      currentGame.value = null;
    };

    const handleScore = (score) => {
      console.log('游戏得分:', score);
    };

    return {
      games,
      currentGame,
      moodStats,
      playGame,
      closeGame,
      handleScore
    };
  }
};
</script>

<style scoped>
.game-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.game-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.game-item:hover {
  background: #f0f0f0;
}

.game-icon {
  font-size: 32px;
  margin-right: 15px;
}

.game-info {
  flex: 1;
}

.game-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.game-desc {
  font-size: 12px;
  color: #999;
}

.game-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a2e;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: #16213e;
  color: #fff;
}

.game-header h3 {
  margin-left: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-item {
  text-align: center;
  padding: 15px 5px;
  background: #fafafa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-good {
  color: #52c41a;
}

.stat-bad {
  color: #ff4d4f;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
