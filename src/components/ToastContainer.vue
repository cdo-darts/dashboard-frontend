<template>
  <v-snackbar
    v-for="toast in toasts"
    :key="toast.id"
    v-model="toast.visible"
    class="toast-snackbar"
    :color="getColor(toast.type)"
    location="top right"
    multi-line
    :timeout="4000"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-3" :icon="getIcon(toast.type)" size="20" />
      <span class="text-body-2">{{ toast.message }}</span>
    </div>

    <template #actions>
      <v-btn
        icon="mdi-close"
        size="small"
        variant="text"
        @click="remove(toast.id)"
      />
    </template>
  </v-snackbar>
</template>

<script setup>
  import { useToast } from '@/composables/useToast'

  const { toasts, remove } = useToast()

  function getColor (type) {
    const colors = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    }
    return colors[type] || 'info'
  }

  function getIcon (type) {
    const icons = {
      success: 'mdi-check-circle',
      error: 'mdi-alert-circle',
      warning: 'mdi-alert',
      info: 'mdi-information',
    }
    return icons[type] || 'mdi-information'
  }
</script>

<style scoped>
.toast-snackbar {
  margin-top: 8px;
}
</style>
