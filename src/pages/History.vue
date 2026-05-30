<template>
  <div class="page-container">
    <div class="page-header">
      <h1>历史日记</h1>
    </div>

    <div v-if="history.length === 0" class="empty-state">
      <div class="icon">📝</div>
      <p>暂无历史记录</p>
      <button class="btn btn-primary mt-15" @click="goBack">开始记录</button>
    </div>

    <div v-else class="history-list">
      <div
        v-for="(item, index) in history"
        :key="index"
        class="history-item"
        @click="viewDetail(item)"
      >
        <div class="history-date">
          <span class="date-day">{{ formatDay(item.date) }}</span>
          <span class="date-month">{{ formatMonth(item.date) }}</span>
        </div>
        <div class="history-content">
          <div class="history-header">
            <span
              class="mood-score small"
              :class="getMoodClass(item.score)"
            >
              {{ item.score }}
            </span>
            <span class="history-emotion">{{ item.emotion || '中性' }}</span>
          </div>
          <div class="history-text">{{ item.text?.substring(0, 50) }}{{ item.text?.length > 50 ? '...' : '' }}</div>
        </div>
      </div>
    </div>

    <div v-if="showDetail" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ selectedItem?.date }}</h3>
          <button class="modal-close" @click="closeDetail">&times;</button>
        </div>
        <div class="detail-content">
          <div class="detail-score">
            <span
              class="mood-score large"
              :class="getMoodClass(selectedItem?.score)"
            >
              {{ selectedItem?.score }}
            </span>
            <span class="detail-emotion">{{ selectedItem?.emotion || '中性' }}</span>
          </div>
          <div class="divider"></div>
          <div class="detail-text">{{ selectedItem?.text }}</div>
          <div v-if="selectedItem?.analysis" class="detail-analysis">
            <h4>分析结果</h4>
            <pre>{{ selectedItem.analysis }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'History',
  setup() {
    const history = ref([]);
    const showDetail = ref(false);
    const selectedItem = ref(null);

    onMounted(() => {
      loadHistory();
    });

    const loadHistory = () => {
      const data = JSON.parse(localStorage.getItem('moodHistory') || '[]');
      history.value = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const formatDay = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.getDate();
    };

    const formatMonth = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      return months[date.getMonth()];
    };

    const getMoodClass = (score) => {
      if (!score) return 'mood-medium';
      if (score >= 18) return 'mood-high';
      if (score >= 12) return 'mood-medium';
      return 'mood-low';
    };

    const viewDetail = (item) => {
      selectedItem.value = item;
      showDetail.value = true;
    };

    const closeDetail = () => {
      showDetail.value = false;
      selectedItem.value = null;
    };

    const goBack = () => {
      history.back();
    };

    return {
      history,
      showDetail,
      selectedItem,
      formatDay,
      formatMonth,
      getMoodClass,
      viewDetail,
      closeDetail,
      goBack
    };
  }
};
</script>

<style scoped>
.history-list {
  padding: 10px;
}

.history-item {
  display: flex;
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.history-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  margin-right: 15px;
  padding-right: 15px;
  border-right: 1px solid #e5e5e5;
}

.date-day {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.date-month {
  font-size: 12px;
  color: #999;
}

.history-content {
  flex: 1;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.history-emotion {
  font-size: 12px;
  color: #666;
}

.history-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.mood-score.small {
  width: 30px;
  height: 30px;
  font-size: 12px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
}

.mood-score.large {
  width: 60px;
  height: 60px;
  font-size: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
}

.detail-content {
  padding: 10px 0;
}

.detail-score {
  text-align: center;
  margin-bottom: 15px;
}

.detail-emotion {
  display: block;
  margin-top: 10px;
  color: #666;
}

.detail-text {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 15px;
}

.detail-analysis {
  background: #fafafa;
  padding: 15px;
  border-radius: 8px;
}

.detail-analysis h4 {
  font-size: 14px;
  margin-bottom: 10px;
}

.detail-analysis pre {
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.mood-high { background: #52c41a; }
.mood-medium { background: #faad14; }
.mood-low { background: #ff4d4f; }
</style>
