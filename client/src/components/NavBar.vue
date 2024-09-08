<template>
  <v-app-bar>
    <v-btn icon @click="toggleSidebar">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <v-toolbar-title>My Application</v-toolbar-title>
    <v-spacer />
    <v-btn icon @click="emit('openSettings')">
      <v-icon>mdi-cog</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts" setup>
  import { defineEmits } from 'vue'

  const emit = defineEmits(['toggleSidebar', 'openSettings'])

  const toggleSidebar = () => {
    emit('toggleSidebar')
  }
</script>

<style scoped>
</style>
