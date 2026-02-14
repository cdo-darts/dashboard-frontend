import { ref } from 'vue'
import { getHealth } from '@/services/api'

export const WIFI_SETUP_ROUTE = '/wifi-setup'

const isInitializing = ref(true)
const hasApiConnection = ref(false)
const pollingEnabled = ref(false)

export async function initializeConnectivity () {
  isInitializing.value = true

  try {
    await getHealth()
    hasApiConnection.value = true
    pollingEnabled.value = true
  } catch {
    hasApiConnection.value = false
    pollingEnabled.value = false
  } finally {
    isInitializing.value = false
  }

  return hasApiConnection.value
}

export function markApiConnected () {
  hasApiConnection.value = true
  pollingEnabled.value = true
}

export function disablePolling () {
  pollingEnabled.value = false
}

export function useConnectivityGate () {
  return {
    isInitializing,
    hasApiConnection,
    pollingEnabled,
  }
}
