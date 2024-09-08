<template>
  <v-container>
    <NavBar @open-settings="openSettingsDialog" @toggle-sidebar="toggleSidebar" />
    <SideBar :sidebar-open="sidebarOpen" />
    <ChatInterface />
    <SettingsDialog :model-value="settingsDialog" @update:model-value="closeSettingsDialog" />
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

  const sidebarOpen = ref(false)
  const settingsDialog = ref(false)

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const openSettingsDialog = () => {
    settingsDialog.value = true
  }

  const closeSettingsDialog = (value: boolean) => {
    settingsDialog.value = value
  }
</script>

<style scoped>
</style>
