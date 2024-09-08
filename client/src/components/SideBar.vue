<template>
  <v-navigation-drawer
    app
    :model-value="sidebarOpen"
    :width="300"
    @update:model-value="updateSidebarOpen"
  >
    <v-btn class="my-4" @click="startNewConversation">
      Start New Conversation
    </v-btn>
    <v-divider />
    <v-list>
      <v-list-item>
        <v-list-item-title>d</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
  import { defineEmits, defineProps } from 'vue'
  import { useMessageStore } from '../stores/useMessageStore'

  const props = defineProps({
    sidebarOpen: Boolean,
  })

  const emit = defineEmits(['update:sidebarOpen'])

  const MessageStore = useMessageStore()

  const updateSidebarOpen = (value: boolean) => {
    emit('update:sidebarOpen', value)
  }

  const startNewConversation = () => {
    MessageStore.clearMessages()
  }

</script>

<style scoped>
.v-navigation-drawer {
  padding: 15px;
}
.v-list-item {
  padding: 10px;
}
.v-btn {
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
