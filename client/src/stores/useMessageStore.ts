import { defineStore } from 'pinia'
import axios from 'axios'
import { marked } from 'marked'
import type { Message } from '../types/message'

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: [] as Message[],
    isSending: false,
    canWrite: true,
    geminiApiKey: '' as string,
  }),
  actions: {
    async sendMessage (text: string) {
      this.messages.push({ text, sender: 'user' })

      this.isSending = true
      this.canWrite = false
      try {
        const response = await axios.post<Message>('http://localhost:8000/api/v1/gemini/send-message', { headers: { Authorization: `Bearer ${this.geminiApiKey}` }, message: text })
        const formattedMessage: string = await marked(response.data.message)

        this.messages.push({ text: '', sender: 'ai' })

        this.displayMessageCharByChar(formattedMessage)
      } catch (error) {
        console.error('Error sending message:', error)
        this.messages.push({ text: 'Error: Failed to send message.', sender: 'system' })
      } finally {
        this.isSending = false
      }
    },

    async postGeminiKey (geminiApiKey: string) {
      try {
        const response = await axios.post('http://localhost:8000/api/v1/gemini/get-gemini-token', { geminiApiKey })
        this.geminiApiKey = geminiApiKey
        console.log('Gemini API Key set successfully:', response.data)
      } catch (error) {
        console.error('Error posting Gemini API Key:', error)
        this.messages.push({ text: 'Error: Failed to set Gemini API Key.', sender: 'system' })
      }
    },

    displayMessageCharByChar (message: string) {
      let displayedMessage = ''
      let currentCharIndex = 0

      const displayNextChar = () => {
        if (currentCharIndex < message.length) {
          displayedMessage += message[currentCharIndex]
          this.messages[this.messages.length - 1].text = displayedMessage
          currentCharIndex++
          setTimeout(displayNextChar, 10)
        } else {
          this.canWrite = true
        }
      }

      displayNextChar()
    },

    clearMessages () {
      this.messages = []
    },

    async testGeminiKey () {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/gemini/send-message', {
          headers: { Authorization: `Bearer ${this.geminiApiKey}` }, message: 'hi',
        })
        console.log('Gemini API Key is valid:', response.data)
      } catch (error) {
        console.error('Error testing Gemini API Key:', error)
        this.messages.push({ text: 'Error: Failed to validate Gemini API Key.', sender: 'system' })
      }
    },
  },
})
