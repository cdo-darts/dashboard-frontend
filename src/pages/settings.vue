<template>
  <v-container class="pa-4 pa-md-6" fluid>
    <div class="mb-6">
      <h1 class="text-h4 text-md-h3 text-primary-high font-weight-bold mb-1">Settings</h1>
      <p class="text-body-2 text-secondary">Configure theme and notifications</p>
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
              <v-icon class="mr-2" icon="mdi-wifi" />Network Setup
            </v-card-title>
            <v-card-text>
              <p class="text-body-2 text-secondary mb-0">
                Network onboarding is now handled by the backend host flow before the dashboard loads.
              </p>
            </v-card-text>
          </glass-card>

          <glass-card class="mt-4">
            <v-card-title class="text-primary-high d-flex align-center">
              <v-icon class="mr-2" icon="mdi-update" />Catalog Updates
            </v-card-title>
            <v-card-text>
              <div class="d-flex flex-column ga-3">
                <p class="text-body-2 text-secondary mb-0">Checks the catalog-driven backend/frontend component list from /api/updates.</p>
                <div class="d-flex flex-wrap ga-2">
                  <v-btn
                    color="primary"
                    :disabled="checkingUpdates"
                    :loading="checkingUpdates"
                    prepend-icon="mdi-refresh"
                    variant="outlined"
                    @click="handleCheckUpdates"
                  >Check for updates</v-btn>
                </div>

                <v-alert
                  v-if="updateStatus"
                  density="comfortable"
                  :type="updateStatus.type"
                  variant="tonal"
                >
                  <div class="text-body-2">{{ updateStatus.message }}</div>
                </v-alert>

                <div v-if="updateGroups.length" class="d-flex flex-column ga-3">
                  <div
                    v-for="group in updateGroups"
                    :key="group.app"
                    class="update-group"
                  >
                    <div class="d-flex justify-space-between align-center mb-2 ga-3">
                      <div>
                        <div class="text-subtitle-2 text-primary-high font-weight-bold">{{ group.app }}</div>
                        <div class="text-caption text-secondary">{{ group.type }}</div>
                      </div>
                      <status-badge :variant="group.hasUpdate ? 'warning' : 'success'">
                        {{ group.hasUpdate ? 'Update Available' : 'Current' }}
                      </status-badge>
                    </div>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip
                        v-for="component in group.components"
                        :key="`${group.app}-${component.kind}`"
                        :color="component.update_available ? 'warning' : undefined"
                        size="small"
                        variant="tonal"
                      >
                        {{ component.kind }}: {{ component.current_version || 'unknown' }} -> {{ component.latest_version || 'unknown' }}
                      </v-chip>
                    </div>
                  </div>
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
import StatusBadge from '@/components/StatusBadge.vue'
import { useToast } from '@/composables/useToast'
import { checkUpdates, getSettings, resetSettings, updateSettings } from '@/services/api'

const { success, error: showError } = useToast()
const theme = useTheme()

const loading = ref(false)
const saving = ref(false)
const resetting = ref(false)
const settings = ref(null)
const checkingUpdates = ref(false)
const updateResult = ref(null)

const localSettings = ref({
  auto_update: { enabled: false, check_interval_hours: 24, check_time: '03:00', auto_install: false },
  notifications: { update_available: true, installation_complete: true },
  display: { theme: 'dark', refresh_interval_seconds: 5 },
})

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

const updateGroups = computed(() => {
  const groups = new Map()
  for (const component of updateResult.value?.components || []) {
    const app = component.app || component.name
    const existing = groups.get(app) || {
      app,
      type: component.type || 'app',
      hasUpdate: false,
      components: [],
    }
    existing.hasUpdate = existing.hasUpdate || !!component.update_available
    existing.components.push(component)
    groups.set(app, existing)
  }
  return Array.from(groups.values()).sort((a, b) => a.app.localeCompare(b.app))
})

const updateStatus = computed(() => {
  if (!updateResult.value) return null
  if (updateGroups.value.some(group => group.hasUpdate)) {
    return { type: 'warning', message: 'One or more catalog components have updates available.' }
  }
  return { type: 'success', message: 'Catalog components are up to date.' }
})

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

async function handleCheckUpdates () {
  try {
    checkingUpdates.value = true
    const response = await checkUpdates()
    updateResult.value = response.data
    if (updateGroups.value.some(group => group.hasUpdate)) success('Update information refreshed')
    else success('Catalog components are up to date')
  } catch (error) {
    showError('Failed to check for updates: ' + error.message)
  } finally {
    checkingUpdates.value = false
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
  await handleCheckUpdates()
})
</script>

<style scoped>
.flex-1-1 { flex: 1 1 0; }
.w-100 { width: 100%; }
.update-group {
  border: 1px solid color-mix(in srgb, var(--app-text-muted) 18%, transparent);
  border-radius: 12px;
  padding: 12px;
}
</style>
