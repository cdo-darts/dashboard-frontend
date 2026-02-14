<template>
  <glass-card hoverable>
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-secondary text-caption mb-1">Disk Usage</div>
          <div class="text-h5 text-primary-high font-weight-bold">
            {{ data?.percent?.toFixed(1) ?? '--' }}%
          </div>
        </div>
        <v-icon
          :color="getStatusColor(data?.percent)"
          icon="mdi-harddisk"
          size="48"
          style="opacity: 0.3"
        />
      </div>

      <v-progress-linear
        :class="`progress-${getStatusVariant(data?.percent)} mb-4`"
        :color="getStatusColor(data?.percent)"
        height="12"
        :model-value="data?.percent ?? 0"
        rounded
      />

      <div class="d-flex justify-space-between align-center mb-3">
        <div class="text-body-2 text-primary-medium">
          <span class="font-weight-bold">
            {{ data?.used_gb?.toFixed(1) ?? '--' }}
          </span>
          <span class="text-secondary"> GB used</span>
        </div>
        <div class="text-caption text-secondary">
          of {{ data?.total_gb?.toFixed(1) ?? '--' }} GB
        </div>
      </div>

      <v-divider class="my-3" style="opacity: 0.1" />

      <div class="d-flex justify-space-between text-caption">
        <div class="text-secondary">Free:</div>
        <div :class="`text-${getStatusVariant(data?.percent)}`">
          {{ data?.free_gb?.toFixed(1) ?? '--' }} GB
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
    if (percent < 70) return 'success'
    if (percent < 90) return 'warning'
    return 'error'
  }

  function getStatusVariant (percent) {
    if (!percent) return 'success'
    if (percent < 70) return 'success'
    if (percent < 90) return 'warning'
    return 'error'
  }
</script>
