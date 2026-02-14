<template>
  <glass-card hoverable>
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-secondary text-caption mb-1">Network & WiFi</div>
          <status-badge
            v-if="isWifiConnected"
            :variant="getSignalVariant(signalQuality)"
          >
            {{ signalQuality }}
          </status-badge>
          <status-badge v-else variant="neutral">
            Disconnected
          </status-badge>
        </div>
        <v-icon
          :color="isWifiConnected ? 'success' : 'secondary'"
          icon="mdi-wifi"
          size="48"
          style="opacity: 0.3"
        />
      </div>

      <div v-if="isWifiConnected">
        <div class="mb-3">
          <v-progress-linear
            class="progress-success"
            color="success"
            height="8"
            :model-value="signalPercent"
            rounded
          />
          <div class="d-flex justify-space-between text-caption mt-1">
            <span class="text-secondary">Signal Strength</span>
            <span class="text-success">{{ signalPercent }}%</span>
          </div>
        </div>

        <div class="text-caption text-secondary mb-1">Signal: {{ signalDbm ?? '--' }} dBm</div>
      </div>

      <div v-else class="text-center py-4">
        <v-icon color="secondary" icon="mdi-wifi-off" size="48" style="opacity: 0.3" />
        <div class="text-caption text-secondary mt-2">Not connected to WiFi</div>
      </div>

      <v-divider class="my-3" style="opacity: 0.1" />

      <div class="text-caption text-secondary mb-2">Network Interfaces:</div>

      <div
        v-for="(iface, name) in networkData?.interfaces"
        :key="name"
        class="mb-3"
      >
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center ga-3">
            <v-icon
              color="primary"
              :icon="name.includes('wlan') ? 'mdi-wifi' : 'mdi-ethernet'"
              size="16"
            />
            <span class="text-body-2 text-primary-medium font-weight-medium">
              {{ formatInterfaceName(name) }}
            </span>
          </div>
          <span v-if="name.includes('wlan')" class="text-caption text-secondary">
            ({{ signalPercent }}%)
          </span>
        </div>

        <div
          v-for="addr in iface.addresses"
          :key="addr.address"
          class="text-caption text-secondary ml-6"
        >
          {{ addr.type.toUpperCase() }}: {{ addr.address }}
        </div>

        <div class="d-flex justify-space-between text-caption text-secondary ml-6 mt-1">
          <span>↓ {{ formatBytes(iface.bytes_recv) }}</span>
          <span>↑ {{ formatBytes(iface.bytes_sent) }}</span>
        </div>
      </div>
    </v-card-text>
  </glass-card>
</template>

<script setup>
  import { computed } from 'vue'
  import GlassCard from '@/components/GlassCard.vue'
  import StatusBadge from '@/components/StatusBadge.vue'

  const props = defineProps({
    wifiData: {
      type: Object,
      default: null,
    },
    networkData: {
      type: Object,
      default: null,
    },
  })

  const isWifiConnected = computed(() => {
    if (props.wifiData?.connected === true) return true
    const interfaces = props.networkData?.interfaces || {}
    return Object.entries(interfaces).some(([name, iface]) => {
      if (!name.toLowerCase().includes('wlan')) return false
      return Array.isArray(iface?.addresses) && iface.addresses.length > 0
    })
  })

  const signalDbm = computed(() => {
    const raw = props.wifiData?.signal_dbm ?? props.wifiData?.signal
    return typeof raw === 'number' ? raw : null
  })

  const signalPercent = computed(() => {
    let raw = props.wifiData?.signal_percent
    if (typeof raw === 'number') return Math.max(0, Math.min(100, Math.round(raw)))
    raw = props.wifiData?.strength
    if (typeof raw === 'number') return Math.max(0, Math.min(100, Math.round(raw)))
    raw = props.wifiData?.signal
    if (typeof raw === 'number' && raw > 0) return Math.max(0, Math.min(100, Math.round(raw)))
    if (typeof signalDbm.value === 'number') {
      const percent = Math.round(2 * (signalDbm.value + 100))
      return Math.max(0, Math.min(100, percent))
    }
    return 0
  })

  const signalQuality = computed(() => {
    if (!isWifiConnected.value) return 'disconnected'
    if (props.wifiData?.quality) return props.wifiData.quality
    const strength = signalPercent.value
    if (strength >= 75) return 'excellent'
    if (strength >= 50) return 'good'
    if (strength >= 25) return 'fair'
    return 'poor'
  })

  function getSignalVariant (quality) {
    const variants = {
      excellent: 'success',
      good: 'info',
      fair: 'warning',
      poor: 'error',
      disconnected: 'neutral',
    }
    return variants[quality] || 'neutral'
  }

  function formatBytes (bytes) {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  function formatInterfaceName (name) {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('wlan')) return 'WiFi'
    if (lowerName.includes('eth')) return 'Ethernet'
    return name
  }
</script>
