<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- navbar -->
        <v-app-bar>
          <v-btn icon @click="toggleSidebar">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
          <v-toolbar-title>My Application</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="openSettingsDialog">
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </v-app-bar>

        <!-- sidebar -->
        <v-navigation-drawer v-model="sidebarOpen" app :width="300">
          <v-btn class="my-4 new-conversation" @click="startNewConversation">
            Start New Conversation
          </v-btn>
          <v-divider />
          <v-list>
            <v-list-item
              v-for="(conversation, index) in Conversations"
              :key="index"
              @click="navigateToConversation(conversation.roomNumber)"
            >
              <v-list-item-title>
                {{ conversation.firstMessage.message }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>

        <!-- chat card -->
        <v-card class="pa-4 chat-card" elevation="3">
          <v-list class="messages-list" dense>
            <v-list-item
              v-for="(message, index) in messages"
              :key="index"
              class="list-message"
              :class="{
                'user-message': message.sender === 'user',
                'ai-message': message.sender === 'ai',
                'system-message': message.sender === 'system',
              }"
            >
              <div v-html="message.text" />
            </v-list-item>
            <v-list-item v-if="isSending" class="ai-message list-message">
              <div class="loader" width="24" />
            </v-list-item>
          </v-list>
          <v-container
            v-if="messages.length === 0"
            align="center"
            class="faq-list"
          >
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
                  :disabled="!canWrite || isSending"
                  icon
                  @click="sendMessage"
                >
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-card>

        <!-- settings dialog -->
        <v-dialog v-model="settingsDialog" max-width="400">
          <v-card>
            <v-card-title>
              <span class="text-h5">Settings</span>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="geminiApiKeyInput"
                :error="isApiKeyInvalid"
                :error-messages="errorMessage"
                label="GEMINI API KEY"
                type="password"
              >
                <template #append>
                  <v-btn @click="testGeminiKey">Test API Key</v-btn>
                </template>
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="blue darken-1"
                @click="closeSettingsDialog(false)"
              >Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  //  import { useRouter } from 'vue-router'

  interface Message {
    text: string
    sender: 'user' | 'ai' | 'system'
  }

  const sidebarOpen = ref(false)
  const settingsDialog = ref(false)
  const messages = ref<Message[]>([])
  const isSending = ref(false)
  const canWrite = ref(true)
  const geminiApiKeyInput = ref('')
  const localInput = ref('')
  const isApiKeyInvalid = ref(false)
  const errorMessage = ref('')
  const roomNumber = ref(null)
  const Conversations = ref([])

  const FAQItems = [
    { question: 'What is cybersecurity?' },
    { question: 'How does quantum encryption work?' },
    { question: 'What is blockchain technology?' },
    { question: 'What are the benefits of using enqode?' },
    { question: 'How does machine learning enhance security?' },
    { question: 'What is a zero-trust security model?' },
  ]

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const openSettingsDialog = () => {
    settingsDialog.value = true
  }

  const closeSettingsDialog = (value: boolean) => {
    settingsDialog.value = value
  }

  //  const router = useRouter()

  const sendMessage = async () => {
    if (!localInput.value) return

    messages.value.push({ text: localInput.value, sender: 'user' })
    isSending.value = true
    canWrite.value = false

    try {
      const apiKey = localStorage.getItem('geminiApiKey')
      if (!apiKey) {
        throw new Error('API key not found in localStorage')
      }

      const payload: any = { message: localInput.value }
      if (roomNumber.value !== 0) {
        payload.roomNumber = roomNumber.value
      }
      console.log(payload)
      const response = await window.axios.post(
        'https://chat-hgbd.onrender.com/api/v1/gemini/send-message',
        payload,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      )

      roomNumber.value = response.data.roomNumber
      //  router.push({ path: `/c/${roomNumber.value}` })

      const formattedMessage: string = window.marked.marked(response.data.message)
      messages.value.push({ text: '', sender: 'ai' })

      displayMessageCharByChar(formattedMessage)
    } catch (error) {
      console.error('Error sending message:', error)
      messages.value.push({ text: 'Error: Failed to send message.', sender: 'system' })
    } finally {
      isSending.value = false
      getAllConversations()
    }

    localInput.value = ''
  }

  const postGeminiKey = async () => {
    try {
      const response = await window.axios.post('https://chat-hgbd.onrender.com/api/v1/gemini/get-gemini-token', { geminiApiKey: geminiApiKeyInput.value })
      console.log('Gemini API Key set successfully:', response.data)
      localStorage.setItem('geminiApiKey', response.data.token)
      isApiKeyInvalid.value = false
      errorMessage.value = ''
      await getAllConversations()
    } catch (error) {
      console.error('Error posting Gemini API Key:', error)
      isApiKeyInvalid.value = true
      errorMessage.value = 'Invalid API Key. Please provide a valid key.'
    }
  }

  const displayMessageCharByChar = (message: string) => {
    let displayedMessage = ''
    let currentCharIndex = 0

    const displayNextChar = () => {
      if (currentCharIndex < message.length) {
        displayedMessage += message[currentCharIndex]
        messages.value[messages.value.length - 1].text = displayedMessage
        currentCharIndex++
        setTimeout(displayNextChar, 10)
      } else {
        canWrite.value = true
      }
    }

    displayNextChar()
  }

  const testGeminiKey = async () => {
    try {
      await postGeminiKey()

      const response = await window.axios.post(
        'https://chat-hgbd.onrender.com/api/v1/gemini/send-message',
        { message: 'Hi' },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('geminiApiKey')}` },
        }
      )

      console.log('Gemini API Key is valid:', response.data)
      isApiKeyInvalid.value = false
      errorMessage.value = ''
    } catch (error) {
      console.error('Error testing Gemini API Key:', error)
      isApiKeyInvalid.value = true
      errorMessage.value = 'Invalid API Key. Please provide a valid key.'
    }
  }

  const handleFAQClick = (question: string) => {
    localInput.value = question
    sendMessage()
  }

  const startNewConversation = () => {
    //  router.push({ path: '/' })
    messages.value = []
    canWrite.value = true
  }

  const navigateToConversation = (Number: number) => {
    roomNumber.value = Number
    //  router.push({ path: `/c/${roomNumber.value}` })
    getAllMessages()
  }

  const getAllConversations = async () => {
    try {
      const response = await window.axios.get('https://chat-hgbd.onrender.com/api/v1/gemini/get-all-rooms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('geminiApiKey')}` },
      })

      Conversations.value = response.data.rooms.sort((a: any, b: any) => {
        const dateA = new Date(a.firstMessage.timestamp).getTime()
        const dateB = new Date(b.firstMessage.timestamp).getTime()
        return dateB - dateA
      })
    } catch (error) {
      console.error('Error getting conversations:', error)
    }
  }

  const getAllMessages = async () => {
    try {
      const response = await window.axios.get(`https://chat-hgbd.onrender.com/api/v1/gemini/get-all-messages/${roomNumber.value}`)
      console.log(response.data.messages)
      messages.value = response.data.messages.map((message: any) => ({ text: window.marked.marked(message.message), sender: message.sender === 'user' ? 'user' : 'ai' }))
    } catch (error) {
      console.error('Error getting messages:', error)
    }
  }

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  onMounted(async () => {
    //  router.push({ path: '/' })

    try {
      await loadScript('https://unpkg.com/axios/dist/axios.min.js')
      if (!window.axios) throw new Error('Axios not loaded')
      await loadScript('https://unpkg.com/marked/marked.min.js')
      if (!window.marked) throw new Error('Marked not loaded')
      await getAllConversations()
    } catch (error) {
      console.error('Error loading scripts or libraries:', error)
    }
  })
</script>

<style>
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
  .list-message {
    align-content: center;
    display: inline-block;
    max-width: 80%;
    word-wrap: break-word;
    padding: 8px;
    margin: 5px 0;
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
    background: var(--_g) 0% 50%, var(--_g) 50% 50%, var(--_g) 100% 50%;
    background-size: calc(100% / 3) 50%;
    animation: l3 1s infinite linear;
  }
  @keyframes l3 {
    20% {
      background-position: 0% 0%, 50% 50%, 100% 50%;
    }
    40% {
      background-position: 0% 100%, 50% 0%, 100% 50%;
    }
    60% {
      background-position: 0% 50%, 50% 100%, 100% 0%;
    }
    80% {
      background-position: 0% 50%, 50% 50%, 100% 100%;
    }
  }
  .v-navigation-drawer {
    padding: 15px;
  }
  .conversations {
    padding: 10px;
  }
  .new-conversation {
    width: 100%;
    border-radius: 30px;
    background: transparent;
    border: 2px solid purple;
    color: purple;
  }
  .v-divider {
    margin-top: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
</style>
