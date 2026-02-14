<template>
  <v-container class="pa-4 pa-md-6" fluid>
    <div class="mb-6">
      <h1 class="text-h4 text-md-h3 text-primary-high font-weight-bold mb-1">Settings</h1>
      <p class="text-body-2 text-secondary">Configure theme, notifications, Wi-Fi, and auto-update behavior</p>
    </div>

    <div v-if="loading && !settings" class="text-center py-16">
      <v-progress-circular color="primary" indeterminate size="64" />
      <div class="text-body-1 text-secondary mt-4">Loading settings...</div>
    </div>

    <div v-else>
      <v-row>
        <v-col cols="12" lg="6">
          <glass-card class="mb-4" elevated>
            <v-card-title class="text-primary-high d-flex align-center">
              <v-icon class="mr-2" icon="mdi-palette" />Display Settings
            </v-card-title>
            <v-card-text>
              <div>
                <div class="text-body-2 text-primary-medium mb-3">Theme</div>
                <v-btn-toggle
                  v-model="localSettings.display.theme"
                  class="w-100"
                  color="primary"
                  divided
                  mandatory
                  variant="outlined"
                >
                  <v-btn class="flex-1-1" value="dark"><v-icon class="mr-2" icon="mdi-weather-night" />Dark</v-btn>
                  <v-btn class="flex-1-1" value="light"><v-icon class="mr-2" icon="mdi-white-balance-sunny" />Light</v-btn>
                </v-btn-toggle>
                <div class="text-caption text-secondary mt-3">Dashboard data refresh is fixed at every 5 seconds.</div>
              </div>
            </v-card-text>
          </glass-card>

          <glass-card class="mb-4">
            <v-card-title class="text-primary-high d-flex align-center"><v-icon class="mr-2" icon="mdi-bell" />Notifications</v-card-title>
            <v-card-text>
              <v-switch
                v-model="localSettings.notifications.update_available"
                class="mb-4"
                color="primary"
                hide-details
                label="Notify when updates are available"
              />
              <v-switch v-model="localSettings.notifications.installation_complete" color="primary" hide-details label="Notify when installation completes" />
            </v-card-text>
          </glass-card>

          <glass-card>
            <v-card-title class="text-primary-high d-flex align-center">
              <v-icon class="mr-2" icon="mdi-wifi" />Wi-Fi Networks
            </v-card-title>
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-3 flex-wrap ga-2">
                <div class="text-caption text-secondary">
                  Connected network: <strong class="text-primary-high">{{ connectedSsid }}</strong>
                </div>
                <v-btn
                  density="compact"
                  :loading="wifiLoading"
                  prepend-icon="mdi-refresh"
                  size="small"
                  variant="outlined"
                  @click="scanNetworks"
                >
                  Scan nearby SSIDs
                </v-btn>
              </div>

              <v-select
                v-model="wifiForm.ssid"
                class="mb-3"
                item-title="title"
                item-value="value"
                :items="wifiNetworkOptions"
                label="Nearby Wi-Fi SSID"
                placeholder="Select a network"
                variant="outlined"
              />

              <v-text-field
                v-model="wifiForm.password"
                :append-inner-icon="showWifiPassword ? 'mdi-eye-off' : 'mdi-eye'"
                class="mb-4"
                label="Wi-Fi password"
                placeholder="Enter network password"
                :type="showWifiPassword ? 'text' : 'password'"
                variant="outlined"
                @click:append-inner="showWifiPassword = !showWifiPassword"
              />

              <v-btn
                block
                color="primary"
                :disabled="!wifiForm.ssid || !wifiForm.password"
                :loading="wifiConnecting"
                prepend-icon="mdi-wifi-plus"
                @click="handleWifiConnect"
              >
                Connect to Network
              </v-btn>
            </v-card-text>
          </glass-card>
        </v-col>

        <v-col cols="12" lg="6">
          <glass-card elevated>
            <v-card-title class="text-primary-high d-flex align-center"><v-icon class="mr-2" icon="mdi-update" />Auto-Update Settings</v-card-title>
            <v-card-text>
              <v-switch
                v-model="localSettings.auto_update.enabled"
                class="mb-6"
                color="primary"
                hide-details
                label="Enable automatic update checks"
              />
              <div v-if="localSettings.auto_update.enabled">
                <div class="mb-6">
                  <div class="text-body-2 text-primary-medium mb-3">Check Interval (hours)</div>
                  <v-text-field
                    v-model.number="localSettings.auto_update.check_interval_hours"
                    density="comfortable"
                    hint="How often to check for updates"
                    :min="1"
                    persistent-hint
                    type="number"
                    variant="outlined"
                  />
                </div>
                <div class="mb-6">
                  <div class="text-body-2 text-primary-medium mb-3">Preferred Check Time</div>
                  <v-text-field
                    v-model="localSettings.auto_update.check_time"
                    density="comfortable"
                    hint="Time of day to check for updates (HH:MM)"
                    persistent-hint
                    type="time"
                    variant="outlined"
                  />
                </div>
                <div>
                  <v-switch v-model="localSettings.auto_update.auto_install" color="warning" hide-details>
                    <template #label>
                      <div>
                        <div class="text-body-2">Automatically install updates</div>
                        <div class="text-caption text-secondary">Updates will be installed without confirmation</div>
                      </div>
                    </template>
                  </v-switch>
                  <v-alert
                    v-if="localSettings.auto_update.auto_install"
                    class="mt-3"
                    density="compact"
                    icon="mdi-alert"
                    type="warning"
                    variant="tonal"
                  >
                    <div class="text-caption">Warning: Updates will be installed automatically without your confirmation.</div>
                  </v-alert>
                </div>
              </div>
            </v-card-text>
          </glass-card>
        </v-col>
      </v-row>

      <glass-card class="mt-6">
        <v-card-text>
          <div class="d-flex flex-column flex-sm-row gap-3 justify-end">
            <v-btn
              color="error"
              :disabled="saving"
              :loading="resetting"
              prepend-icon="mdi-restore"
              variant="outlined"
              @click="handleReset"
            >Reset to Defaults</v-btn>
            <v-btn
              color="primary"
              :disabled="resetting || !hasChanges"
              :loading="saving"
              prepend-icon="mdi-content-save"
              size="large"
              @click="handleSave"
            >Save Settings</v-btn>
          </div>
        </v-card-text>
      </glass-card>
    </div>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useTheme } from 'vuetify'
  import GlassCard from '@/components/GlassCard.vue'
  import { useToast } from '@/composables/useToast'
  import {
    connectWifiNetwork,
    getSettings,
    getSystemStatus,
    resetSettings,
    scanWifiNetworks,
    updateSettings,
  } from '@/services/api'

  const { success, error: showError } = useToast()
  const theme = useTheme()

  const loading = ref(false)
  const saving = ref(false)
  const resetting = ref(false)
  const settings = ref(null)
  const wifiLoading = ref(false)
  const wifiConnecting = ref(false)
  const showWifiPassword = ref(false)
  const connectedSsid = ref('Not connected')
  const wifiNetworks = ref([])
  const wifiForm = ref({ ssid: '', password: '' })

  const localSettings = ref({
    auto_update: { enabled: false, check_interval_hours: 24, check_time: '03:00', auto_install: false },
    notifications: { update_available: true, installation_complete: true },
    display: { theme: 'dark', refresh_interval_seconds: 5 },
  })

  const wifiNetworkOptions = computed(() => wifiNetworks.value.map(network => ({
    title: `${network.ssid}${network.signal_percent === undefined ? '' : ` (${network.signal_percent}%)`}`,
    value: network.ssid,
  })))

  function applyTheme (themeName) {
    const targetTheme = themeName === 'light' ? 'light' : 'dark'
    theme.change(targetTheme)
    localStorage.setItem('vertex-theme', targetTheme)
  }

  watch(() => localSettings.value.display.theme, newTheme => {
    applyTheme(newTheme)
  })

  const hasChanges = computed(() => {
    if (!settings.value) return false
    return JSON.stringify(settings.value) !== JSON.stringify(localSettings.value)
  })

  async function fetchCurrentWifiStatus () {
    try {
      const response = await getSystemStatus()
      connectedSsid.value = response.data?.wifi?.ssid || 'Not connected'
    } catch {
      connectedSsid.value = 'Unknown'
    }
  }

  async function scanNetworks () {
    try {
      wifiLoading.value = true
      const response = await scanWifiNetworks()
      const networks = response.data?.networks || []
      wifiNetworks.value = networks.map(network => ({
        ssid: network.ssid,
        signal_percent: network.signal_percent ?? network.signal ?? network.strength,
      })).filter(network => Boolean(network.ssid))
    } catch (error) {
      showError('Failed to scan Wi-Fi networks: ' + error.message)
      wifiNetworks.value = []
    } finally {
      wifiLoading.value = false
    }
  }

  async function handleWifiConnect () {
    try {
      wifiConnecting.value = true
      await connectWifiNetwork({
        ssid: wifiForm.value.ssid,
        password: wifiForm.value.password,
      })
      success(`Attempting to connect to ${wifiForm.value.ssid}`)
      wifiForm.value.password = ''
      await fetchCurrentWifiStatus()
    } catch (error) {
      showError('Failed to connect to Wi-Fi: ' + error.message)
    } finally {
      wifiConnecting.value = false
    }
  }

  async function fetchSettings () {
    try {
      loading.value = true
      const response = await getSettings()
      settings.value = response.data
      localSettings.value = structuredClone(response.data)
      localSettings.value.display.refresh_interval_seconds = 5
      applyTheme(localSettings.value.display.theme)
    } catch (error) {
      showError('Failed to load settings: ' + error.message)
    } finally {
      loading.value = false
    }
  }

  async function handleSave () {
    try {
      saving.value = true
      localSettings.value.display.refresh_interval_seconds = 5
      const response = await updateSettings(localSettings.value)
      settings.value = response.data.settings
      localSettings.value = structuredClone(response.data.settings)
      localSettings.value.display.refresh_interval_seconds = 5
      applyTheme(localSettings.value.display.theme)
      success('Settings saved successfully')
    } catch (error) {
      showError('Failed to save settings: ' + error.message)
    } finally {
      saving.value = false
    }
  }

  async function handleReset () {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) return
    try {
      resetting.value = true
      const response = await resetSettings()
      settings.value = response.data.settings
      localSettings.value = structuredClone(response.data.settings)
      localSettings.value.display.refresh_interval_seconds = 5
      applyTheme(localSettings.value.display.theme)
      success('Settings reset to defaults')
    } catch (error) {
      showError('Failed to reset settings: ' + error.message)
    } finally {
      resetting.value = false
    }
  }

  onMounted(async () => {
    await fetchSettings()
    await fetchCurrentWifiStatus()
    await scanNetworks()
  })
</script>

<style scoped>
.flex-1-1 { flex: 1 1 0; }
.w-100 { width: 100%; }
</style>
