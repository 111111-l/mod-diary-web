<template>
  <div class="page-container chat-page">
    <div class="page-header">
      <h1>{{ friend?.nickname || '聊天' }}</h1>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message-item"
        :class="{ own: msg.isOwn }"
      >
        <div v-if="!msg.isOwn" class="message-avatar">
          {{ friend?.nickname?.[0] || '👤' }}
        </div>
        <div class="message-bubble">
          <div class="message-content">{{ msg.content }}</div>
          <div class="message-time">{{ msg.time }}</div>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <input
        type="text"
        class="chat-input"
        v-model="inputMessage"
        placeholder="输入消息..."
        @keyup.enter="sendMessage"
      />
      <button class="btn btn-primary" @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue';

export default {
  name: 'Chat',
  setup() {
    const messages = ref([]);
    const inputMessage = ref('');
    const friend = ref(null);
    const userInfo = ref(null);
    const messagesContainer = ref(null);

    onMounted(() => {
      loadData();
    });

    const loadData = () => {
      userInfo.value = JSON.parse(localStorage.getItem('userInfo') || 'null');

      const friendId = new URLSearchParams(window.location.search).get('friendId') ||
                       localStorage.getItem('currentFriendId');

      const friends = JSON.parse(localStorage.getItem('friends') || '[]');
      friend.value = friends.find(f => f.id === friendId);

      const chatKey = `chat_${userInfo.value?.id}_${friendId}`;
      messages.value = JSON.parse(localStorage.getItem(chatKey) || '[]');

      if (friend.value) {
        friend.value.unread = 0;
        localStorage.setItem('friends', JSON.stringify(friends));
      }
    };

    const sendMessage = () => {
      if (!inputMessage.value.trim()) return;

      const msg = {
        id: Date.now(),
        content: inputMessage.value,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        senderId: userInfo.value?.id
      };

      messages.value.push(msg);
      saveMessages();

      const replyDelay = 1000 + Math.random() * 1500;
      setTimeout(() => {
        const replies = [
          '好的，收到！',
          '嗯嗯，我知道了',
          '加油！',
          '你今天心情怎么样？',
          '记得每天写日记哦',
          '一起努力！'
        ];
        const replyMsg = {
          id: Date.now(),
          content: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          isOwn: false,
          senderId: friend.value?.id
        };
        messages.value.push(replyMsg);
        saveMessages();
        scrollToBottom();
      }, replyDelay);

      inputMessage.value = '';
      scrollToBottom();
    };

    const saveMessages = () => {
      if (!userInfo.value || !friend.value) return;
      const chatKey = `chat_${userInfo.value.id}_${friend.value.id}`;
      localStorage.setItem(chatKey, JSON.stringify(messages.value));
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    return {
      messages,
      inputMessage,
      friend,
      messagesContainer,
      sendMessage
    };
  }
};
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: #f5f5f5;
}

.message-item {
  display: flex;
  margin-bottom: 15px;
}

.message-item.own {
  flex-direction: row-reverse;
}

.message-avatar {
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
  margin-right: 10px;
}

.message-item.own .message-avatar {
  margin-right: 0;
  margin-left: 10px;
}

.message-bubble {
  max-width: 70%;
  background: #fff;
  border-radius: 8px;
  padding: 10px 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-item.own .message-bubble {
  background: #1989fa;
  color: #fff;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}

.message-time {
  font-size: 10px;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.message-item.own .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.chat-input-area {
  display: flex;
  padding: 10px 15px;
  background: #fff;
  border-top: 1px solid #e5e5e5;
}

.chat-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.chat-input:focus {
  border-color: #1989fa;
}

.chat-input-area .btn {
  margin-left: 10px;
  border-radius: 20px;
}
</style>
