<template>
  <div :class="['connection-indicator', connected ? 'connected' : 'disconnected']">
    {{ connected ? 'Connected' : 'Disconnected' }}
  </div>
</template>

<script setup>
  defineProps({
    connected: {
      type: Boolean,
      required: true,
    },
  })
</script>
