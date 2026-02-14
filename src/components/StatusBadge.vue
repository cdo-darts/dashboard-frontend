<template>
  <span :class="['status-badge', `badge-${variant}`]">
    <slot />
  </span>
</template>

<script setup>
  defineProps({
    variant: {
      type: String,
      default: 'neutral',
      validator: value => ['success', 'warning', 'error', 'info', 'neutral'].includes(value),
    },
  })
</script>
