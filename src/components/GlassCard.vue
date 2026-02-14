<template>
  <v-card
    :class="[
      elevated ? 'glass-card-elevated' : 'glass-card',
      hoverable ? 'hoverable-card' : '',
      customClass,
    ]"
    flat
    :rounded="rounded"
  >
    <slot />
  </v-card>
</template>

<script setup>
  defineProps({
    elevated: {
      type: Boolean,
      default: false,
    },
    hoverable: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: String,
      default: 'lg',
    },
    customClass: {
      type: String,
      default: '',
    },
  })
</script>
