<template>
  <el-dialog
    v-model="dialogVisible"
    title="文案小助手"
    width="800px"
    :before-close="handleClose"
    style="border-radius: 20px;"
  >
    <div class="chat-container" ref="chatContainer">
      <div class="chat-messages">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          :class="['message', message.type]"
        >
          <div class="message-content">
            <div v-if="message.type === 'user'" class="user-avatar">
              <el-avatar size="small" :src="userAvatar" />
            </div>
            <div v-else class="assistant-avatar">
              <el-avatar size="small" :src="assistantAvatar" />
            </div>
            <div class="message-text">
              <p>{{ message.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="input-container">
        <el-input
          v-model="currentMessage"
          type="textarea"
          placeholder="请输入(比如请给我写一段关于落日的文案)"
          rows="3"
          @keyup.enter="sendMessage"
          :disabled="isSending"
        />
        <el-button 
          type="primary" 
          :disabled="!currentMessage || isSending" 
          @click="sendMessage"
          :loading="isSending"
          color="#ff2442" text-color="white" bg-color="#42b983"
        >
          发送
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, nextTick, defineExpose } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from "@/store/userStore";
// API 配置
const userStore = useUserStore();
const API_URL = 'https://api.moonshot.cn/v1/chat/completions';

const API_KEY = ''; 

// 弹窗状态

const dialogVisible = ref(false);

// 消息状态

const messages = ref([{ text: "欢迎！我是文案小助手" }]);

const currentMessage = ref('');

const isSending = ref(false);

// 头像

const userAvatar = userStore.getUserInfo().avatar;

const assistantAvatar = 'https://statics.moonshot.cn/kimi-web-seo/assets/favicon-OXkYivQY.ico';

// 聊天容器引用
const chatContainer = ref(null);

// 打开弹窗
const openDialog = () => {
  dialogVisible.value = true;
  nextTick(() => {
    scrollToBottom();
  });
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
};

// 发送消息
const sendMessage = async () => {
  if (!currentMessage.value.trim()) return;

  // 添加用户消息
  messages.value.push({
    type: 'user',
    text: currentMessage.value
  });

  // 清空输入框
  const messageToSend = currentMessage.value;
  currentMessage.value = '';

  // 滚动到底部
  scrollToBottom();

  // 发送请求
  isSending.value = true;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [{ role: 'user', content: messageToSend }]
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    // 添加助手回复
    messages.value.push({
      type: 'assistant',
      text: assistantResponse
    });

    // 滚动到底部
    scrollToBottom();
  } catch (error) {
    ElMessage.error('网络有问题，请稍后再试');
    console.error('Error:', error);
  } finally {
    isSending.value = false;
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// 自动聚焦输入框
onMounted(() => {
  scrollToBottom();
});

// 暴露方法给父组件
defineExpose({
  openDialog
});
</script>

<style scoped>
.chat-container {
  height: 400px;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f7fa;
  margin-bottom: 16px;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  max-width: 150%;
}

.message.user {
  margin-left: auto;
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  display: flex;
  align-items: flex-start;
}

.user-avatar {
  margin-right: 10px;
}

.assistant-avatar {
  margin-left: 10px;
}

.message-text {
  background-color: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 80%;
  word-break: break-word;
}

.message.user .message-text {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #000;
}

.message.assistant .message-text {
  background-color: white;
  border: 1px solid #e8e8e8;
}

.input-container {
  display: flex;
  gap: 10px;
}

:deep(.el-textarea) {
  flex: 1;
}

:deep(.el-button) {
  margin-left: 10px;
}
</style>