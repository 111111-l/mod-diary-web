const positiveWords = [
  '开心', '快乐', '高兴', '幸福', '喜悦', '愉快', '欢乐', '美好', '棒', '赞',
  '优秀', '出色', '完美', '顺利', '成功', '兴奋', '激动', '满足', '感恩',
  '爱', '喜欢', '希望', '期待', '充实', '温暖', '感动', '甜蜜', '舒适',
  '轻松', '自在', '平静', '安心', '放心', '自信', '鼓励', '加油', '阳光',
  '哈哈', '嘿嘿', '嘻嘻', '大笑', '微笑', '甜', '美', '靓', '酷', '帅',
  'luck', 'happy', 'joy', 'love', 'good', 'great', 'wonderful', 'excellent'
];

const negativeWords = [
  '难过', '伤心', '悲伤', '痛苦', '难受', '不爽', '郁闷', '烦躁', '生气',
  '愤怒', '生气', '发火', '恼火', '失望', '沮丧', '灰心', '绝望', '无助',
  '焦虑', '担心', '忧虑', '害怕', '恐惧', '紧张', '压力', '压抑', '疲惫',
  '累', '困', '饿', '累', '无聊', '寂寞', '孤独', '空虚', '迷茫', '困惑',
  '抱怨', '委屈', '无奈', '遗憾', '后悔', '自责', '内疚', '惭愧', '羞愧',
  'sad', 'angry', 'fear', 'worried', 'anxious', 'stress', 'tired', 'bored',
  'lonely', 'upset', 'hurt', 'bad', 'terrible', 'awful', 'hate', 'cry'
];

const emotionCategories = {
  '开心': ['开心', '快乐', '高兴', '愉快', '欢乐', '棒', '赞', '美好', '幸福'],
  '悲伤': ['难过', '伤心', '悲伤', '痛苦', '难受'],
  '愤怒': ['生气', '愤怒', '发火', '恼火', '烦躁'],
  '焦虑': ['焦虑', '担心', '忧虑', '紧张', '压力', '压抑'],
  '疲惫': ['累', '困', '疲惫', '疲惫不堪'],
  '中性': []
};

export async function analyzeSentiment(text) {
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  const foundPositiveWords = [];
  const foundNegativeWords = [];

  positiveWords.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      positiveCount++;
      foundPositiveWords.push(word);
    }
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      negativeCount++;
      foundNegativeWords.push(word);
    }
  });

  let emotion = '中性';
  for (const [cat, words] of Object.entries(emotionCategories)) {
    if (words.some(w => lowerText.includes(w))) {
      emotion = cat;
      break;
    }
  }

  let score;
  if (positiveCount > negativeCount) {
    score = 18 + Math.min(positiveCount * 2, 12);
    emotion = '开心';
  } else if (negativeCount > positiveCount) {
    score = Math.max(5, 15 - negativeCount * 3);
    if (negativeCount >= 3) emotion = '悲伤';
    else if (negativeCount >= 2) emotion = '焦虑';
    else emotion = '疲惫';
  } else {
    score = 15;
    emotion = '中性';
  }

  score = Math.min(30, Math.max(0, score));

  let level;
  if (score >= 22) level = '非常积极';
  else if (score >= 18) level = '积极';
  else if (score >= 15) level = '略微积极';
  else if (score >= 12) level = '略微低落';
  else if (score >= 8) level = '低落';
  else level = '非常低落';

  let suggestion;
  if (score >= 22) {
    suggestion = '保持好心情，享受生活的每一刻！你的积极情绪很有感染力！';
  } else if (score >= 18) {
    suggestion = '今天的心情真棒，记得记录下这些美好瞬间。';
  } else if (score >= 15) {
    suggestion = '适当放松一下，调整自己的状态。试着做一些小运动，释放压力。';
  } else if (score >= 12) {
    suggestion = '找朋友聊聊天，分享一下你的想法。出去散散步，看看风景。';
  } else if (score >= 8) {
    suggestion = '别太难过，一切都会好起来的。试着深呼吸，放松一下自己的情绪。';
  } else {
    suggestion = '如果持续感到低落，建议和身边的人谈谈，或者寻求专业的帮助。';
  }

  const emotionWords = [];
  if (foundPositiveWords.length > 0) {
    emotionWords.push(`积极词汇: ${foundPositiveWords.slice(0, 5).join(', ')}`);
  }
  if (foundNegativeWords.length > 0) {
    emotionWords.push(`消极词汇: ${foundNegativeWords.slice(0, 5).join(', ')}`);
  }

  return {
    score,
    emotion,
    level,
    analysis: [
      `情感分类: ${emotion}`,
      `心情等级: ${level}`,
      `积极词汇匹配: ${positiveCount}个`,
      `消极词汇匹配: ${negativeCount}个`
    ].join('\n'),
    suggestion,
    emotionWords: emotionWords.join('\n'),
    detail: {
      pos_weight: positiveCount / 10,
      neg_weight: negativeCount / 10,
      words: [
        ...foundPositiveWords.map(w => ({ t: 'pos', w, wt: '1.0' })),
        ...foundNegativeWords.map(w => ({ t: 'neg', w, wt: '1.0' }))
      ]
    }
  };
}

export function getMoodLabel(score) {
  if (score >= 22) return '非常积极';
  if (score >= 18) return '积极';
  if (score >= 15) return '略微积极';
  if (score >= 12) return '略微低落';
  if (score >= 8) return '低落';
  return '非常低落';
}
