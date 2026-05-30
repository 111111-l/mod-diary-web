<template>
  <div class="page-container">
    <div class="page-header">
      <h1>写日记</h1>
    </div>

    <div class="card">
      <div class="card-title">今日心情</div>
      <div class="form-group">
        <textarea
          class="textarea"
          v-model="content"
          placeholder="今天发生了什么？"
          rows="8"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">心情指数</label>
        <div class="mood-slider">
          <input
            type="range"
            min="0"
            max="30"
            v-model="moodScore"
            class="slider"
          />
          <div class="mood-display">
            <span
              class="mood-score large"
              :class="getMoodClass(moodScore)"
            >
              {{ moodScore }}
            </span>
            <span class="mood-label">{{ getMoodLabel(moodScore) }}</span>
          </div>
        </div>
      </div>

      <button
        class="btn btn-primary btn-block"
        @click="saveDiary"
        :disabled="!content.trim()"
      >
        保存日记
      </button>
    </div>

    <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Edit',
  setup() {
    const content = ref('');
    const moodScore = ref(15);
    const toastMessage = ref('');

    const getMoodClass = (score) => {
      score = parseInt(score);
      if (score >= 18) return 'mood-high';
      if (score >= 12) return 'mood-medium';
      return 'mood-low';
    };

    const getMoodLabel = (score) => {
      score = parseInt(score);
      if (score >= 22) return '非常开心';
      if (score >= 18) return '开心';
      if (score >= 15) return '略微开心';
      if (score >= 12) return '略微低落';
      if (score >= 8) return '低落';
      return '非常低落';
    };

    const saveDiary = () => {
      if (!content.value.trim()) {
        showToast('请输入日记内容');
        return;
      }

      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

      const diary = {
        id: Date.now(),
        date: dateKey,
        content: content.value,
        moodScore: parseInt(moodScore.value),
        userId: userInfo?.id,
        createdAt: today.toISOString()
      };

      const diaries = JSON.parse(localStorage.getItem('diaries') || '[]');
      diaries.push(diary);
      localStorage.setItem('diaries', JSON.stringify(diaries));

      let history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
      const existingIndex = history.findIndex(h => h.date === dateKey);

      if (existingIndex >= 0) {
        history[existingIndex] = {
          ...history[existingIndex],
          score: parseInt(moodScore.value),
          text: content.value.substring(0, 50)
        };
      } else {
        history.push({
          date: dateKey,
          score: parseInt(moodScore.value),
          text: content.value.substring(0, 50),
          timestamp: today.getTime()
        });
      }

      history.sort((a, b) => new Date(a.date) - new Date(b.date));
      localStorage.setItem('moodHistory', JSON.stringify(history));

      content.value = '';
      moodScore.value = 15;
      showToast('保存成功！');
    };

    const showToast = (msg) => {
      toastMessage.value = msg;
      setTimeout(() => {
        toastMessage.value = '';
      }, 2000);
    };

    return {
      content,
      moodScore,
      toastMessage,
      getMoodClass,
      getMoodLabel,
      saveDiary
    };
  }
};
</script>

<style scoped>
.mood-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.slider {
  width: 100%;
  height: 40px;
  -webkit-appearance: none;
  background: linear-gradient(to right, #ff4d4f, #faad14, #52c41a);
  border-radius: 20px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.mood-display {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mood-score.large {
  width: 50px;
  height: 50px;
  font-size: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
}

.mood-label {
  font-size: 14px;
  color: #666;
}

.mood-high { background: #52c41a; }
.mood-medium { background: #faad14; }
.mood-low { background: #ff4d4f; }
</style>
