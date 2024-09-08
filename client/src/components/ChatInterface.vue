<template>
  <v-card class="pa-4 chat-card" elevation="3">
    <v-list class="messages-list" dense>
      <v-list-item
        v-for="(message, index) in messageStore.messages"
        :key="index"
        :class="{
          'user-message': message.sender === 'user',
          'ai-message': message.sender === 'ai',
          'system-message': message.sender === 'system',
        }"
      >
        <div v-html="message.text" />
      </v-list-item>
      <v-list-item v-if="messageStore.isSending" class="ai-message">
        <div class="loader" width="24" />
      </v-list-item>
    </v-list>
    <v-container v-if="messageStore.messages.length === 0" align="center" class="faq-list">
      <v-btn
        v-for="(item, index) in FAQItems"
        :key="index"
        class="faq-button"
        outlined
        rounded
        small
        @click="handleFAQClick(item.question)"
      >
        {{ item.question }}
      </v-btn>
    </v-container>

    <v-divider />
    <div class="input-area">
      <v-row align="center" justify="center">
        <v-col cols="11">
          <v-textarea
            v-model="localInput"
            auto-grow
            label="Type a message..."
            outlined
            persistent-placeholder
            rows="1"
          />
        </v-col>
        <v-col class="d-flex align-center" cols="1">
          <v-btn
            color="primary"
            :disabled="!messageStore.canWrite || messageStore.isSending"
            icon
            @click="sendMessage"
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useMessageStore } from '../stores/useMessageStore'

  const messageStore = useMessageStore()

  const FAQItems = [
    { question: 'What is cybersecurity?' },
    { question: 'How does quantum encryption work?' },
    { question: 'What is blockchain technology?' },
    { question: 'What are the benefits of using enqode?' },
    { question: 'How does machine learning enhance security?' },
    { question: 'What is a zero-trust security model?' },
  ]

  const localInput = ref('')

  const sendMessage = async () => {
    if (!localInput.value) return

    await messageStore.sendMessage(localInput.value)

    localInput.value = ''
  }

  const handleFAQClick = (question: string) => {
    localInput.value = question
    sendMessage()
  }
</script>

<style scoped>
  .chat-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 89vh;
    width: 100%;
    margin: 0;
  }
  .user-message {
    align-self: flex-end;
    background: rgb(115, 0, 181);
    color: white;
    border-radius: 17px 10px 0px 17px !important;
  }
  .ai-message {
    align-self: flex-start;
    background: #d2d2d2;
    color: black;
    border-radius: 10px 17px 17px 0 !important;
  }
  .system-message {
    align-self: center;
    color: #e92727;
  }
  .messages-list {
    flex-direction: column;
    display: flex;
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 10px;
  }
  .input-area {
    position: sticky;
    bottom: 0;
    padding: 10px;
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  }
  .v-list-item {
    align-content: center;
    display: inline-block;
    max-width: 80%;
    word-wrap: break-word;
    padding: 8px;
    margin: 5px 0;
  }
  .v-container {
    margin: 0;
    padding: 0;
  }
  .faq-list {
    margin-bottom: 16px;
  }
  .faq-button {
    margin: 5px;
  }
  .loader {
    width: 40px;
    aspect-ratio: 2;
    --_g: no-repeat radial-gradient(circle closest-side, #858585 90%, #0000);
    background:
      var(--_g) 0%   50%,
      var(--_g) 50%  50%,
      var(--_g) 100% 50%;
    background-size: calc(100%/3) 50%;
    animation: l3 1s infinite linear;
  }

  @keyframes l3 {
    20% { background-position: 0% 0%, 50% 50%, 100% 50%; }
    40% { background-position: 0% 100%, 50% 0%, 100% 50%; }
    60% { background-position: 0% 50%, 50% 100%, 100% 0%; }
    80% { background-position: 0% 50%, 50% 50%, 100% 100%; }
  }
</style>
