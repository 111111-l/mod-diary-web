<template>
  <div class="page-container">
    <div class="page-header">
      <h1>每日一记</h1>
      <p class="text-muted">{{ currentDate }}</p>
    </div>

    <div class="card">
      <div class="card-title">记录今天的心情</div>
      <div class="form-group">
        <textarea
          class="textarea"
          v-model="moodText"
          placeholder="今天发生了什么？你的心情如何？"
          rows="4"
        ></textarea>
      </div>
      <button
        class="btn btn-primary"
        @click="analyzeMood"
        :disabled="!moodText.trim() || isAnalyzing"
      >
        {{ isAnalyzing ? '分析中...' : '分析心情' }}
      </button>
    </div>

    <div v-if="todayRecords.length > 0" class="card mt-15">
      <div class="card-title">今日记录</div>
      <div v-for="record in todayRecords" :key="record.id" class="record-item">
        <div class="record-header">
          <span class="mood-score" :class="getMoodClass(record.score)">
            {{ record.score }}
          </span>
          <span class="record-time">{{ record.time }}</span>
          <span class="record-emotion">{{ record.emotion }}</span>
        </div>
        <div class="record-text">{{ record.text }}</div>
        <div v-if="record.analysis" class="record-analysis">
          <div class="analysis-result" v-html="formatAnalysis(record.analysis)"></div>
        </div>
      </div>
    </div>

    <div v-if="moodHistory.length > 0" class="card mt-15">
      <div class="card-title">心情趋势</div>
      <div class="mood-chart">
        <div
          v-for="(item, index) in moodHistory.slice(-7)"
          :key="index"
          class="chart-bar-container"
        >
          <div
            class="chart-bar"
            :class="getMoodClass(item.score)"
            :style="{ height: (item.score / 30 * 100) + '%' }"
          ></div>
          <div class="chart-label">{{ formatDate(item.date) }}</div>
        </div>
      </div>
      <div class="mood-legend">
        <span class="legend-item"><span class="dot mood-high"></span> 开心 (18-30)</span>
        <span class="legend-item"><span class="dot mood-medium"></span> 一般 (12-17)</span>
        <span class="legend-item"><span class="dot mood-low"></span> 低落 (0-11)</span>
      </div>
    </div>

    <div class="card mt-15">
      <div class="card-title">历史日记</div>
      <button class="btn btn-default" @click="viewHistory">查看全部</button>
    </div>

    <div v-if="showResult" class="modal-overlay" @click.self="closeResult">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">心情分析结果</h3>
          <button class="modal-close" @click="closeResult">&times;</button>
        </div>
        <div class="result-content">
          <div class="result-score">
            <div
              class="big-mood-score"
              :class="getMoodClass(moodScore)"
            >
              {{ moodScore }}
            </div>
            <p class="text-muted">心情分数 (0-30)</p>
          </div>
          <div v-if="moodResult" class="result-analysis" v-html="formatAnalysis(moodResult)"></div>
          <div v-if="suggestion" class="result-suggestion">
            <h4>💡 建议</h4>
            <p>{{ suggestion }}</p>
          </div>
          <div v-if="emotionWords" class="result-words">
            <h4>📊 词汇分析</h4>
            <pre>{{ emotionWords }}</pre>
          </div>
        </div>
        <button class="btn btn-primary btn-block mt-15" @click="closeResult">确定</button>
      </div>
    </div>

    <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { analyzeSentiment } from '../utils/sentiment';

export default {
  name: 'Index',
  emits: ['navigate'],
  setup(props, { emit }) {
    const moodText = ref('');
    const moodScore = ref(50);
    const moodResult = ref('');
    const suggestion = ref('');
    const emotionWords = ref('');
    const isAnalyzing = ref(false);
    const showResult = ref(false);
    const toastMessage = ref('');
    const moodHistory = ref([]);
    const todayRecords = ref([]);
    const userInfo = ref(null);

    const currentDate = computed(() => {
      const now = new Date();
      return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    });

    onMounted(() => {
      loadData();
    });

    const loadData = () => {
      userInfo.value = JSON.parse(localStorage.getItem('userInfo') || 'null');

      const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
      moodHistory.value = history;

      const today = new Date();
      const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const todayData = history.find(h => h.date === todayKey);
      todayRecords.value = todayData ? [todayData] : [];
    };

    const analyzeMood = async () => {
      if (!moodText.value.trim()) {
        showToast('请输入心情内容');
        return;
      }

      isAnalyzing.value = true;

      try {
        const result = await analyzeSentiment(moodText.value);

        moodScore.value = result.score || 15;
        moodResult.value = result.analysis || '';
        suggestion.value = result.suggestion || generateSuggestion(result.score || 15);
        emotionWords.value = result.emotionWords || '';

        saveMoodRecord({
          score: moodScore.value,
          text: moodText.value,
          emotion: result.emotion || '中性',
          analysis: moodResult.value,
          emotionWords: emotionWords.value
        });

        showResult.value = true;
        checkMoodAlert();
      } catch (error) {
        console.error('分析失败:', error);
        moodScore.value = 15;
        suggestion.value = generateSuggestion(15);
        showResult.value = true;
      }

      isAnalyzing.value = false;
      moodText.value = '';
    };

    const saveMoodRecord = (record) => {
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const timeStr = `${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;

      const newRecord = {
        id: Date.now(),
        date: dateKey,
        time: timeStr,
        timestamp: today.getTime(),
        score: record.score,
        text: record.text,
        emotion: record.emotion,
        analysis: record.analysis,
        emotionWords: record.emotionWords
      };

      let history = JSON.parse(localStorage.getItem('moodHistory') || '[]');

      const existingIndex = history.findIndex(h => h.date === dateKey);
      if (existingIndex >= 0) {
        history[existingIndex] = {
          ...history[existingIndex],
          ...newRecord
        };
      } else {
        history.push(newRecord);
      }

      history.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (history.length > 30) {
        history = history.slice(-30);
      }

      localStorage.setItem('moodHistory', JSON.stringify(history));
      moodHistory.value = history;

      todayRecords.value = [newRecord];

      showToast(`保存成功！心情分数: ${record.score}`);
    };

    const generateSuggestion = (score) => {
      const suggestions = {
        high: [
          '保持好心情，享受生活的每一刻！',
          '你的积极情绪很有感染力！',
          '今天的心情真棒，记得记录下这些美好瞬间。'
        ],
        medium: [
          '适当放松一下，调整自己的状态。',
          '试着做一些小运动，释放压力。',
          '找朋友聊聊天，分享一下你的想法。'
        ],
        low: [
          '别太难过，一切都会好起来的。',
          '试着深呼吸，放松一下自己的情绪。',
          '出去散散步，看看风景，心情会慢慢变好。'
        ]
      };

      let level;
      if (score >= 18) level = 'high';
      else if (score < 12) level = 'low';
      else level = 'medium';

      const arr = suggestions[level];
      return arr[Math.floor(Math.random() * arr.length)];
    };

    const checkMoodAlert = () => {
      const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
      if (!user || user.role !== 'student') return;

      const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
      if (history.length < 5) return;

      const last5 = history.slice(-5);
      const allLow = last5.every(h => h.score < 15);

      if (allLow) {
        const alertKey = `lastMoodAlert_${user.id}`;
        const lastAlert = localStorage.getItem(alertKey);
        const now = new Date().toISOString().split('T')[0];

        if (lastAlert !== now) {
          localStorage.setItem(alertKey, now);

          const classes = JSON.parse(localStorage.getItem('classes') || '[]');
          const studentClass = classes.find(c => c.code === user.classCode);

          const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

          const alertNotification = {
            id: Date.now(),
            type: 'mood_alert',
            title: '⚠️ 学生心情预警',
            content: `${user.nickname} 连续5天心情分数低于15分，请关注！`,
            studentId: user.id,
            studentName: user.nickname,
            classId: studentClass?.id || '',
            className: studentClass?.name || '',
            createdAt: new Date().toISOString(),
            read: false
          };

          notifications.push(alertNotification);
          localStorage.setItem('notifications', JSON.stringify(notifications));
        }
      }
    };

    const getMoodClass = (score) => {
      if (score >= 18) return 'mood-high';
      if (score >= 12) return 'mood-medium';
      return 'mood-low';
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const formatAnalysis = (text) => {
      if (!text) return '';
      return text.replace(/\n/g, '<br>');
    };

    const closeResult = () => {
      showResult.value = false;
    };

    const showToast = (msg) => {
      toastMessage.value = msg;
      setTimeout(() => {
        toastMessage.value = '';
      }, 2000);
    };

    const viewHistory = () => {
      emit('navigate', { page: 'History' });
    };

    return {
      moodText,
      moodScore,
      moodResult,
      suggestion,
      emotionWords,
      isAnalyzing,
      showResult,
      toastMessage,
      moodHistory,
      todayRecords,
      currentDate,
      analyzeMood,
      getMoodClass,
      formatDate,
      formatAnalysis,
      closeResult,
      viewHistory
    };
  }
};
</script>

<style scoped>
.page-header {
  background: #fff;
  padding: 15px;
  text-align: center;
  border-bottom: 1px solid #e5e5e5;
}

.page-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.record-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.record-time {
  color: #999;
  font-size: 12px;
}

.record-emotion {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.record-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.record-analysis {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e5e5e5;
}

.analysis-result {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

.mood-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 120px;
  padding: 10px 0;
}

.chart-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.chart-bar {
  width: 30px;
  min-height: 10px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

.chart-label {
  font-size: 10px;
  color: #999;
  margin-top: 5px;
}

.mood-legend {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.mood-high { background: #52c41a; }
.mood-medium { background: #faad14; }
.mood-low { background: #ff4d4f; }

.result-content {
  text-align: center;
}

.result-score {
  margin-bottom: 20px;
}

.big-mood-score {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
}

.result-analysis {
  text-align: left;
  padding: 15px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 1.6;
}

.result-suggestion {
  text-align: left;
  padding: 15px;
  background: #f6ffed;
  border-radius: 8px;
  margin-bottom: 15px;
}

.result-suggestion h4 {
  margin-bottom: 8px;
}

.result-suggestion p {
  font-size: 14px;
  line-height: 1.6;
}

.result-words {
  text-align: left;
  padding: 15px;
  background: #fff7e6;
  border-radius: 8px;
}

.result-words h4 {
  margin-bottom: 8px;
  font-size: 14px;
}

.result-words pre {
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
