<template>
  <v-container class="page" fluid>
    <div class="page__bg" aria-hidden="true"></div>

    <v-container class="page__content" max-width="1100">
      <header class="hero">
        <div class="hero__brand">
          <img :src="cdoLogo" alt="CDO Darts" class="hero__logo" />
          <div class="hero__product">
            <span class="hero__tag hero__tag--product">CDO Vertex</span>
            <span class="hero__tag hero__tag--muted">WiFi Setup</span>
          </div>
        </div>
        <div class="hero__copy">
          <h1 class="hero__title">Connect your CDO Vertex</h1>
          <p class="hero__subtitle">
            Choose your WiFi network, enter the password, and we will take care of the rest.
          </p>
        </div>
      </header>

      <v-card class="panel" elevation="10">
        <v-card-text>
          <div class="panel__grid">
            <div class="panel__left">
              <h2 class="panel__title">Select a network</h2>
              <p class="panel__hint">
                Scan for nearby networks and pick the one your phone or laptop is on.
              </p>

              <v-select
                v-model="selectedSsid"
                :items="networkOptions"
                :loading="isScanning"
                label="Available WiFi"
                item-title="label"
                item-value="ssid"
                variant="outlined"
                density="comfortable"
                class="panel__field"
                :menu-props="{ maxHeight: 320 }"
                :disabled="isSubmitting"
              />

              <div class="panel__actions">
                <v-btn
                  variant="text"
                  color="primary"
                  :loading="isScanning"
                  :disabled="isSubmitting"
                  @click="scanNetworks"
                >
                  Rescan networks
                </v-btn>
                <span class="panel__meta">{{ scanStatus }}</span>
              </div>
            </div>

            <div class="panel__right">
              <h2 class="panel__title">Enter password</h2>
              <p class="panel__hint">
                Your details stay on this device. We use them only to connect.
              </p>

              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="WiFi password"
                variant="outlined"
                density="comfortable"
                class="panel__field"
                :disabled="isSubmitting || isOpenNetwork"
                :placeholder="isOpenNetwork ? 'Open network does not require a password' : ''"
                @keyup.enter="submitConnection"
              >
                <template #append-inner>
                  <v-btn
                    icon
                    variant="text"
                    :disabled="isOpenNetwork"
                    @click="showPassword = !showPassword"
                  >
                    <v-icon>{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                  </v-btn>
                </template>
              </v-text-field>

              <div class="panel__cta">
                <v-btn
                  class="connect-btn"
                  size="large"
                  :loading="isSubmitting"
                  :disabled="!canSubmit"
                  @click="submitConnection"
                >
                  Connect to WiFi
                </v-btn>
                <v-btn variant="text" prepend-icon="mdi-cog" @click="router.push('/settings')">
                  Back to Settings
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <section class="info">
        <div class="info__card">
          <h3>After connecting</h3>
          <p>
            Join the same WiFi network your CDO system connects to, then visit
            <strong>http://cdo-autodarts.local:3180</strong> to finish setup.
          </p>
        </div>
      </section>
    </v-container>

    <v-dialog v-model="showConnecting" persistent width="420">
      <v-card class="dialog">
        <v-card-text class="dialog__body">
          <v-progress-circular
            indeterminate
            size="56"
            width="5"
            color="primary"
          />
          <div>
            <h3>Establishing WiFi connection</h3>
            <p>Please wait while we connect to {{ selectedSsid || 'your network' }}.</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showError" width="520">
      <v-card class="dialog dialog--error">
        <v-card-text>
          <h3>Connection pending</h3>
          <p class="dialog__lead">{{ errorMessage }}</p>
          <p>
            Connect your phone/laptop to <strong>{{ selectedSsid || 'the configured SSID' }}</strong>
            and open <strong>http://cdo-vertex.local</strong>.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showError = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import cdoLogo from '@/assets/logo.png'
  import { connectWifiNetwork, getHealth, scanWifiNetworks } from '@/services/api'
  import { disablePolling, markApiConnected } from '@/composables/useConnectivityGate'

  const router = useRouter()

  const networks = ref([])
  const selectedSsid = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const isScanning = ref(false)
  const isSubmitting = ref(false)
  const scanStatus = ref('')
  const showConnecting = ref(false)
  const showError = ref(false)
  const errorMessage = ref('')

  const networkOptions = computed(() =>
    networks.value.map(network => ({
      ...network,
      label: network.ssid,
    })),
  )

  const isOpenNetwork = computed(() => {
    const selected = networks.value.find(network => network.ssid === selectedSsid.value)
    return selected?.security === 'open'
  })

  const canSubmit = computed(() => {
    if (!selectedSsid.value || isSubmitting.value) return false
    if (isOpenNetwork.value) return true
    return password.value.trim().length > 0
  })

  async function scanNetworks () {
    isScanning.value = true
    scanStatus.value = 'Scanning...'

    try {
      const response = await scanWifiNetworks()
      networks.value = response.data?.networks || []
      scanStatus.value = networks.value.length
        ? `Found ${networks.value.length} networks`
        : 'No networks found'

      if (!selectedSsid.value && networks.value.length) {
        selectedSsid.value = networks.value[0].ssid
      }
    } catch {
      scanStatus.value = 'Scan unavailable'
      networks.value = []
    } finally {
      isScanning.value = false
    }
  }

  async function submitConnection () {
    if (!canSubmit.value) return

    isSubmitting.value = true
    showConnecting.value = true
    showError.value = false
    errorMessage.value = ''

    try {
      await connectWifiNetwork({
        ssid: selectedSsid.value,
        password: isOpenNetwork.value ? '' : password.value,
      })

      await waitForApi()
      markApiConnected()
      showConnecting.value = false
      router.replace('/')
    } catch {
      showConnecting.value = false
      errorMessage.value = 'The device connected to WiFi, but the dashboard API was not reachable within 30 seconds.'
      showError.value = true
    } finally {
      isSubmitting.value = false
    }
  }

  async function waitForApi () {
    const timeoutAt = Date.now() + 30_000

    while (Date.now() < timeoutAt) {
      try {
        await getHealth()
        return
      } catch {
        await new Promise(resolve => setTimeout(resolve, 2_000))
      }
    }

    throw new Error('API timeout')
  }

  onMounted(() => {
    disablePolling()
    scanNetworks()
  })
</script>

<style scoped>
  :global(body) {
    font-family: 'Segoe UI', 'Tahoma', 'Verdana', 'Arial', sans-serif;
    background: #0f1115;
  }

  .page {
    min-height: 100vh;
    padding: 0;
    color: #f6f7f9;
    position: relative;
    overflow: hidden;
  }

  .page__bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 20%, rgba(242, 70, 40, 0.25), transparent 50%),
      radial-gradient(circle at 80% 10%, rgba(47, 120, 255, 0.2), transparent 45%),
      linear-gradient(120deg, #0f1115, #141924);
    z-index: 0;
  }

  .page__content {
    position: relative;
    z-index: 1;
    padding: 48px 24px 80px;
  }

  .hero { display: grid; gap: 20px; align-items: center; margin-bottom: 32px; text-align: center; }
  .hero__brand { display: grid; justify-items: center; gap: 12px; }
  .hero__logo { height: 120px; width: auto; }
  .hero__product { display: grid; gap: 6px; align-items: center; justify-items: center; }
  .hero__tag { font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.14em; color: rgba(246, 247, 249, 0.95); }
  .hero__tag--product { font-size: 1.9rem; letter-spacing: 0.18em; }
  .hero__title { font-size: clamp(2.2rem, 3vw, 3.4rem); margin: 0 0 8px; }
  .hero__subtitle { margin: 0 auto; font-size: 1.1rem; color: rgba(246, 247, 249, 0.9); max-width: 640px; }
  .panel { border-radius: 24px; background: rgba(16, 20, 28, 0.9); border: 1px solid rgba(255, 255, 255, 0.06); }
  .panel__grid { display: grid; gap: 32px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  .panel__hint { color: rgba(246, 247, 249, 0.95); margin-bottom: 20px; }
  .panel__field { margin-bottom: 12px; }
  .panel__actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .panel__meta { font-size: 0.85rem; }
  .panel__cta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .connect-btn { background: linear-gradient(135deg, #25b269, #1f8f58); color: #ffffff; font-weight: 600; text-transform: none; }
  .info { margin-top: 36px; }
  .info__card { background: rgba(20, 24, 34, 0.8); border-radius: 18px; padding: 20px 22px; }
  .dialog { border-radius: 18px; background: #121620; color: rgba(246, 247, 249, 0.98); }
  .dialog__body { display: flex; gap: 16px; align-items: center; }
  .dialog--error { border: 1px solid rgba(242, 70, 40, 0.35); }
</style>
