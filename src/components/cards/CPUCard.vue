<template>
  <glass-card hoverable>
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-secondary text-caption mb-1">CPU Usage</div>
          <div class="text-h5 text-primary-high font-weight-bold">
            {{ data?.usage_percent?.toFixed(1) ?? '--' }}%
          </div>
        </div>
        <v-icon
          :color="getStatusColor(data?.usage_percent)"
          icon="mdi-chip"
          size="48"
          style="opacity: 0.3"
        />
      </div>

      <v-progress-circular
        class="mx-auto d-block mb-4"
        :class="`circular-progress-${getStatusVariant(data?.usage_percent)}`"
        :color="getStatusColor(data?.usage_percent)"
        :model-value="data?.usage_percent ?? 0"
        :size="120"
        :width="12"
      >
        <div class="text-center">
          <div class="text-h4 font-weight-bold text-primary-high">
            {{ data?.usage_percent?.toFixed(0) ?? '--' }}
          </div>
          <div class="text-caption text-secondary">percent</div>
        </div>
      </v-progress-circular>

      <v-divider class="my-3" style="opacity: 0.1" />

      <div class="d-flex justify-space-between text-caption">
        <div class="text-secondary">Cores:</div>
        <div class="text-primary-medium">{{ data?.core_count ?? '--' }}</div>
      </div>
      <div class="d-flex justify-space-between text-caption mt-1">
        <div class="text-secondary">Frequency:</div>
        <div class="text-primary-medium">
          {{ data?.frequency_mhz ? `${data.frequency_mhz.toFixed(0)} MHz` : '--' }}
        </div>
      </div>
    </v-card-text>
  </glass-card>
</template>

<script setup>
  import GlassCard from '@/components/GlassCard.vue'

  defineProps({
    data: {
      type: Object,
      default: null,
    },
  })

  function getStatusColor (percent) {
    if (!percent) return 'secondary'
    if (percent < 50) return 'success'
    if (percent < 80) return 'warning'
    return 'error'
  }

  function getStatusVariant (percent) {
    if (!percent) return 'success'
    if (percent < 50) return 'success'
    if (percent < 80) return 'warning'
    return 'error'
  }
</script>
