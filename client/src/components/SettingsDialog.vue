<template>
  <v-dialog max-width="400" :model-value="settingsDialog" @update:model-value="emitCloseDialog">
    <v-card>
      <v-card-title>
        <span class="text-h5">Settings</span>
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="geminiApiKeyInput"
          label="GEMINI API KEY"
          type="password"
        >
          <template #append>
            <v-btn @click="testApiKey">Test API Key</v-btn>
          </template>
        </v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" @click="closeSettings">close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useMessageStore } from '../stores/useMessageStore'

  const props = defineProps({
    settingsDialog: Boolean,
  })

  const emit = defineEmits(['update:model-value'])
  const MessageStore = useMessageStore()
  const geminiApiKeyInput = ref(MessageStore.geminiApiKey)

  const emitCloseDialog = () => {
    emit('update:model-value', false)
  }

  const testApiKey = async () => {
    try {
      // Pass the actual value of the API key, not the ref object
      await MessageStore.postGeminiKey(geminiApiKeyInput.value)
      await MessageStore.testGeminiKey()
    } catch (error) {
      console.error('Failed to test API key', error)
    }
  }

  const closeSettings = () => {
    emitCloseDialog()
  }
</script>

<style scoped>
</style>
