<template>
  <glass-card elevated>
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-h6 text-primary-high font-weight-bold mb-1">
            {{ hostnameData?.hostname || 'CDO Vertex' }}
          </div>
          <div class="text-caption text-secondary">
            {{ hostnameData?.platform }} · {{ hostnameData?.architecture }}
          </div>
        </div>
        <v-icon color="primary" icon="mdi-raspberry-pi" size="48" style="opacity: 0.5" />
      </div>

      <v-divider class="my-3" style="opacity: 0.1" />

      <div class="d-flex justify-space-between align-center mb-2">
        <div class="text-caption text-secondary">Uptime:</div>
        <div class="text-body-2 text-primary-medium font-weight-medium">
          {{ uptimeData?.uptime_formatted || '--' }}
        </div>
      </div>

      <div class="d-flex justify-space-between align-center mb-2">
        <div class="text-caption text-secondary">Boot Time:</div>
        <div class="text-caption text-primary-medium">
          {{ formatBootTime(uptimeData?.boot_time) }}
        </div>
      </div>

      <div v-if="apiVersion" class="d-flex justify-space-between align-center">
        <div class="text-caption text-secondary">API Version:</div>
        <div class="text-caption text-primary-medium">
          {{ apiVersion }}
        </div>
      </div>
    </v-card-text>
  </glass-card>
</template>

<script setup>
  import GlassCard from '@/components/GlassCard.vue'

  defineProps({
    hostnameData: {
      type: Object,
      default: null,
    },
    uptimeData: {
      type: Object,
      default: null,
    },
    apiVersion: {
      type: String,
      default: '',
    },
  })

  function formatBootTime (bootTime) {
    if (!bootTime) return '--'
    const date = new Date(bootTime)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
</script>
