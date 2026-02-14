<template>
  <v-container class="pa-4 pa-md-6" fluid>
    <div class="d-flex justify-space-between align-start flex-wrap gap-3 mb-6">
      <div>
        <h1 class="text-h4 text-md-h3 text-primary-high font-weight-bold mb-1">Camera Focus View</h1>
        <p class="text-body-2 text-secondary">Inspect each camera feed in detail for alignment and focus adjustments</p>
      </div>
      <v-btn prepend-icon="mdi-arrow-left" variant="text" @click="router.push('/apps/autodarts')">Back to Autodarts</v-btn>
    </div>

    <glass-card class="mb-4">
      <v-card-text>
        <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-3">
          <div class="text-body-1 text-primary-high">
            Cameras detected: <strong>{{ cameras.length }}</strong>
          </div>
          <div class="d-flex ga-2">
            <v-btn :disabled="cameras.length === 0" icon="mdi-chevron-left" variant="outlined" @click="prevCamera" />
            <v-btn :disabled="cameras.length === 0" icon="mdi-chevron-right" variant="outlined" @click="nextCamera" />
            <v-btn :loading="loading" prepend-icon="mdi-refresh" variant="outlined" @click="loadCameras">Refresh</v-btn>
          </div>
        </div>

        <v-select
          v-model="selectedCameraId"
          class="mb-4"
          density="comfortable"
          hide-details
          :items="cameraOptions"
          label="Active camera"
          variant="outlined"
        />

        <div v-if="currentCamera" class="camera-stage">
          <div class="camera-stage-toolbar">
            <v-btn icon="mdi-magnify-minus-outline" variant="text" @click="zoomOut" />
            <span class="text-caption text-secondary">Zoom {{ zoom.toFixed(1) }}x</span>
            <v-btn icon="mdi-magnify-plus-outline" variant="text" @click="zoomIn" />
          </div>

          <div class="camera-image-wrapper" @wheel.prevent="handleWheelZoom">
            <img :alt="currentCamera.name" class="camera-image" :src="currentCamera.feed_url" :style="imageStyle">
          </div>
        </div>

        <div v-else class="text-center py-10">
          <v-icon color="secondary" icon="mdi-camera-off" size="56" />
          <div class="text-body-2 text-secondary mt-2">No camera feed available</div>
        </div>
      </v-card-text>
    </glass-card>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import GlassCard from '@/components/GlassCard.vue'
  import { useToast } from '@/composables/useToast'
  import { getCameras } from '@/services/api'

  const router = useRouter()
  const { error: showError } = useToast()

  const loading = ref(false)
  const cameras = ref([])
  const selectedCameraId = ref(null)
  const zoom = ref(1)

  const cameraOptions = computed(() => cameras.value.map(camera => ({
    title: `${camera.name}${camera.active ? ' · live' : ' · idle'}`,
    value: camera.id,
  })))

  const currentCamera = computed(() => cameras.value.find(camera => camera.id === selectedCameraId.value))

  const imageStyle = computed(() => ({ transform: `scale(${zoom.value})` }))

  async function loadCameras () {
    try {
      loading.value = true
      const response = await getCameras()
      cameras.value = response.data?.cameras || []
      if (!selectedCameraId.value && cameras.value.length > 0) {
        selectedCameraId.value = cameras.value[0].id
      }
      if (selectedCameraId.value && !cameras.value.some(camera => camera.id === selectedCameraId.value)) {
        selectedCameraId.value = cameras.value[0]?.id || null
      }
    } catch (error) {
      showError('Failed to load camera feeds: ' + error.message)
      cameras.value = []
      selectedCameraId.value = null
    } finally {
      loading.value = false
    }
  }

  function nextCamera () {
    if (cameras.value.length === 0) return
    const index = cameras.value.findIndex(camera => camera.id === selectedCameraId.value)
    const nextIndex = (index + 1) % cameras.value.length
    selectedCameraId.value = cameras.value[nextIndex].id
  }

  function prevCamera () {
    if (cameras.value.length === 0) return
    const index = cameras.value.findIndex(camera => camera.id === selectedCameraId.value)
    const prevIndex = index <= 0 ? cameras.value.length - 1 : index - 1
    selectedCameraId.value = cameras.value[prevIndex].id
  }

  function zoomIn () {
    zoom.value = Math.min(zoom.value + 0.2, 3)
  }
  function zoomOut () {
    zoom.value = Math.max(zoom.value - 0.2, 1)
  }
  function handleWheelZoom (event) {
    if (event.deltaY < 0) zoomIn()
    else zoomOut()
  }

  watch(selectedCameraId, () => {
    zoom.value = 1
  })

  onMounted(loadCameras)
</script>

<style scoped>
.camera-stage {
  border: 1px solid color-mix(in srgb, var(--app-text-muted) 30%, transparent);
  border-radius: 12px;
  overflow: hidden;
}

.camera-stage-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--app-text-muted) 20%, transparent);
}

.camera-image-wrapper {
  max-height: 70vh;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  background: color-mix(in srgb, var(--app-surface-strong) 75%, transparent);
}

.camera-image {
  max-width: 100%;
  transform-origin: top center;
  transition: transform 0.2s ease;
  border-radius: 8px;
}
</style>
