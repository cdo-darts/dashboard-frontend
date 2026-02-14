<template>
  <glass-card hoverable @click="$emit('click')">
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-secondary text-caption mb-1">Autodarts</div>
          <status-badge v-if="data?.installed" :variant="getStatusVariant()">
            {{ getStatusText() }}
          </status-badge>
          <status-badge v-else variant="neutral">Not Installed</status-badge>
        </div>
        <v-icon color="primary" icon="mdi-bullseye-arrow" size="48" style="opacity: 0.3" />
      </div>

      <div v-if="data?.installed">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-caption text-secondary">Version:</span>
          <span class="text-body-2 text-primary-medium font-weight-medium">{{ data.version }}</span>
        </div>

        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-caption text-secondary">Status:</span>
          <div class="d-flex align-center gap-2">
            <div :class="['status-indicator', data.active ? 'status-active' : 'status-inactive']" />
            <span class="text-caption text-primary-medium">{{ data.status }}</span>
          </div>
        </div>

        <div v-if="data.update_available" class="mt-3">
          <v-alert
            class="text-caption"
            density="compact"
            icon="mdi-arrow-up-circle"
            type="info"
            variant="tonal"
          >
            Update available: v{{ data.latest_version }}
          </v-alert>
        </div>
      </div>

      <div v-else class="text-center py-4">
        <v-icon color="secondary" icon="mdi-package-variant" size="48" style="opacity: 0.3" />
        <div class="text-caption text-secondary mt-2">Click to install Autodarts</div>
      </div>
    </v-card-text>
  </glass-card>
</template>

<script setup>
  import GlassCard from '@/components/GlassCard.vue'
  import StatusBadge from '@/components/StatusBadge.vue'

  const props = defineProps({
    data: {
      type: Object,
      default: null,
    },
  })

  defineEmits(['click'])

  function getStatusVariant () {
    if (!props.data?.active) return 'neutral'
    return 'success'
  }

  function getStatusText () {
    if (!props.data) return 'Unknown'
    if (props.data.active) return 'Running'
    return 'Stopped'
  }
</script>

<style scoped>
.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-active {
  background: #25b269;
  box-shadow: 0 0 8px rgba(37, 178, 105, 0.6);
  animation: pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-inactive {
  background: #f24628;
  box-shadow: 0 0 8px rgba(242, 70, 40, 0.6);
}

@keyframes pulse-green {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px rgba(37, 178, 105, 0.6);
  }

  50% {
    opacity: 0.6;
    box-shadow: 0 0 4px rgba(37, 178, 105, 0.4);
  }
}
</style>
