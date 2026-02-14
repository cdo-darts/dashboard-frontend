<template>
  <glass-card hoverable>
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-secondary text-caption mb-1">Temperature</div>
          <status-badge v-if="data?.status" :variant="getStatusVariant(data.status)">
            {{ data.status }}
          </status-badge>
        </div>
        <v-icon
          :color="getStatusColor(data?.status)"
          icon="mdi-thermometer"
          size="48"
          style="opacity: 0.3"
        />
      </div>

      <div v-if="data?.status === 'unavailable'" class="text-center py-8">
        <v-icon color="secondary" icon="mdi-thermometer-alert" size="64" style="opacity: 0.3" />
        <div class="text-body-2 text-secondary mt-3">Sensor unavailable</div>
      </div>

      <div v-else class="text-center py-4">
        <div class="text-h1 font-weight-bold" :class="`text-${getStatusVariant(data?.status)}`">
          {{ data?.celsius?.toFixed(1) ?? '--' }}°
        </div>
        <div class="text-h6 text-secondary mt-1">
          {{ data?.fahrenheit?.toFixed(1) ?? '--' }}°F
        </div>

        <v-divider class="my-4" style="opacity: 0.1" />

        <div class="d-flex justify-center gap-2">
          <v-icon
            :color="getStatusColor(data?.status)"
            :icon="getTempIcon(data?.status)"
            size="20"
          />
          <span class="text-caption text-primary-medium">
            {{ getTempDescription(data?.status) }}
          </span>
        </div>
      </div>
    </v-card-text>
  </glass-card>
</template>

<script setup>
  import GlassCard from '@/components/GlassCard.vue'
  import StatusBadge from '@/components/StatusBadge.vue'

  defineProps({
    data: {
      type: Object,
      default: null,
    },
  })

  function getStatusColor (status) {
    const colors = {
      normal: 'success',
      warm: 'warning',
      hot: 'warning',
      critical: 'error',
      unavailable: 'secondary',
    }
    return colors[status] || 'secondary'
  }

  function getStatusVariant (status) {
    const variants = {
      normal: 'success',
      warm: 'warning',
      hot: 'warning',
      critical: 'error',
      unavailable: 'neutral',
    }
    return variants[status] || 'neutral'
  }

  function getTempIcon (status) {
    const icons = {
      normal: 'mdi-check-circle',
      warm: 'mdi-alert',
      hot: 'mdi-alert',
      critical: 'mdi-fire',
      unavailable: 'mdi-help-circle',
    }
    return icons[status] || 'mdi-thermometer'
  }

  function getTempDescription (status) {
    const descriptions = {
      normal: 'Running cool',
      warm: 'Slightly warm',
      hot: 'Running hot',
      critical: 'Critical temperature',
      unavailable: 'No data',
    }
    return descriptions[status] || 'Unknown'
  }
</script>
