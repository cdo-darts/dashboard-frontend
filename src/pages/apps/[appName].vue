<template>
  <v-container class="pa-4 pa-md-6" fluid>
    <div class="mb-6 d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center ga-3">
      <div>
        <h1 class="text-h4 text-md-h3 text-primary-high font-weight-bold mb-1">
          {{ app?.displayName || route.params.appName }}
        </h1>
        <p class="text-body-2 text-secondary">
          Catalog-driven app details and install controls
        </p>
      </div>
      <v-btn prepend-icon="mdi-arrow-left" variant="text" @click="router.push('/apps')">
        Back to Apps
      </v-btn>
    </div>

    <v-alert
      v-if="errorMessage"
      class="mb-4"
      density="comfortable"
      type="error"
      variant="tonal"
    >
      {{ errorMessage }}
    </v-alert>

    <div v-if="loading && !app" class="text-center py-16">
      <v-progress-circular color="primary" indeterminate size="64" />
      <div class="text-body-1 text-secondary mt-4">Loading app details...</div>
    </div>

    <template v-else-if="app">
      <glass-card class="mb-4">
        <v-card-text>
          <div class="d-flex justify-space-between align-start ga-3 mb-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" size="56" variant="tonal">
                <v-icon :icon="resolveAppIcon(app.icon)" />
              </v-avatar>
              <div>
                <div class="text-h5 text-primary-high font-weight-bold">
                  {{ app.displayName }}
                </div>
                <div class="text-body-2 text-secondary">
                  {{ app.description || "No description provided in catalog." }}
                </div>
              </div>
            </div>
            <status-badge :variant="badgeVariant">
              {{ badgeText }}
            </status-badge>
          </div>

          <div class="detail-grid mb-4">
            <div>
              <div class="text-caption text-secondary">Name</div>
              <div class="text-body-2 text-primary-high font-weight-medium">
                {{ app.name }}
              </div>
            </div>
            <div>
              <div class="text-caption text-secondary">Type</div>
              <div class="text-body-2 text-primary-high font-weight-medium">
                {{ app.type }}
              </div>
            </div>
            <div>
              <div class="text-caption text-secondary">Repo</div>
              <div class="text-body-2 text-primary-high font-weight-medium">
                {{ app.repo }}
              </div>
            </div>
            <div>
              <div class="text-caption text-secondary">Service</div>
              <div class="text-body-2 text-primary-high font-weight-medium">
                {{ app.serviceName || "None" }}
              </div>
            </div>
          </div>

          <div v-if="webUiLinks.length" class="mb-4">
            <div class="text-caption text-secondary mb-2">Web UI</div>
            <div class="d-flex flex-wrap ga-2">
              <v-btn
                v-for="link in webUiLinks"
                :key="link.href"
                color="primary"
                prepend-icon="mdi-open-in-new"
                rel="noopener noreferrer"
                target="_blank"
                :href="link.href"
                variant="outlined"
              >
                {{ link.label }}
              </v-btn>
            </div>
            <div v-if="webUiHint" class="text-caption text-secondary mt-2">
              {{ webUiHint }}
            </div>
          </div>

          <div class="mb-4">
            <div class="text-caption text-secondary mb-2">Update components</div>
            <div v-if="components.length" class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="component in components"
                :key="component.kind"
                :color="component.update_available ? 'warning' : undefined"
                size="small"
                variant="tonal"
              >
                {{ component.kind }}: {{ component.current_version || "unknown" }} -> {{ component.latest_version || "unknown" }}
              </v-chip>
            </div>
            <div v-else class="text-body-2 text-secondary">
              No update component data returned for this app.
            </div>
          </div>

          <div v-if="app.customPort && !isInstalled" class="mb-3">
            <v-text-field
              v-model="installPort"
              density="comfortable"
              label="Custom port"
              type="number"
              variant="outlined"
            />
          </div>

          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-if="!isInstalled"
              color="primary"
              :disabled="installRunning"
              :loading="installRunning"
              prepend-icon="mdi-download"
              @click="runAppAction"
            >
              Install
            </v-btn>
            <v-btn
              v-if="isInstalled && hasUpdateAvailable"
              color="warning"
              :disabled="installRunning"
              :loading="installRunning"
              prepend-icon="mdi-update"
              @click="runAppAction"
            >
              Update
            </v-btn>
            <v-btn
              color="secondary"
              :disabled="!jobId"
              prepend-icon="mdi-text-box-search"
              variant="outlined"
              @click="fetchLog"
            >
              Refresh log
            </v-btn>
          </div>

          <div v-if="installError" class="mt-4">
            <v-alert density="comfortable" type="error" variant="tonal">
              {{ installError }}
            </v-alert>
          </div>

          <div v-if="jobId" class="mt-4">
            <div class="text-caption text-secondary mb-2">{{ actionLabel }} job {{ jobId }}</div>
            <div class="detail-log-panel">
              <pre class="detail-log-content">{{ installLog || "Waiting for installer output..." }}</pre>
            </div>
          </div>
        </v-card-text>
      </glass-card>
    </template>

    <v-alert v-else icon="mdi-alert" prominent type="warning" variant="tonal">
      This route was not found in the current /api/apps catalog response.
    </v-alert>
  </v-container>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import GlassCard from "@/components/GlassCard.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import { useToast } from "@/composables/useToast";
import {
  checkUpdates,
  getAppJobLog,
  getAppJobStatus,
  getAppsCatalog,
  installApp,
} from "@/services/api";

const INSTALL_POLL_MS = 1500;

const route = useRoute();
const router = useRouter();
const { success, error: showError } = useToast();

const loading = ref(false);
const errorMessage = ref("");
const apps = ref([]);
const updateComponents = ref([]);
const installPort = ref("");
const installRunning = ref(false);
const installLog = ref("");
const installError = ref("");
const jobId = ref("");
const actionLabel = ref("Install");
let pollTimer = null;

const app = computed(() => {
  const routePath = `/${String(route.path || "").replace(/^\/+/, "")}`;
  const appName = String(route.params.appName || "");
  return apps.value.find((item) => item.ui?.route === routePath || item.name === appName) || null;
});

const components = computed(() =>
  updateComponents.value.filter((component) => (component.app || component.name) === app.value?.name),
);

const isInstalled = computed(() =>
  components.value.some((component) => {
    const version = String(component.current_version || "").trim().toLowerCase();
    return version && version !== "unknown" && version !== "not installed";
  }),
);

const hasUpdateAvailable = computed(() =>
  components.value.some((component) => component.update_available),
);

const deviceHost = computed(() => {
  if (typeof window === "undefined") return "cdo-vertex.local";
  const host = window.location.hostname;
  return host && host !== "localhost" ? host : "cdo-vertex.local";
});

const protocol = computed(() => {
  if (typeof window === "undefined") return "http";
  return window.location.protocol === "https:" ? "https" : "http";
});

const webUiLinks = computed(() => {
  if (!app.value || !isInstalled.value) return [];

  const links = [];

  if (app.value.name === "autodarts") {
    links.push({
      label: "Open Board Manager",
      href: `${protocol.value}://${deviceHost.value}:3180`,
    });
  }

  if (app.value.name !== "autodarts" && app.value.defaultPort) {
    links.push({
      label: app.value.name === "vertex-bridge" ? "Open Bridge UI" : "Open Web UI",
      href: `${protocol.value}://${deviceHost.value}:${app.value.defaultPort}`,
    });
  }

  return Array.from(new Map(links.map((link) => [link.href, link])).values());
});

const webUiHint = computed(() => {
  if (!webUiLinks.value.length) return "";
  if (app.value?.name === "autodarts") {
    return "Board Manager opens in a new tab on the device network address.";
  }
  return "The web UI opens in a new tab using this device's current host name.";
});

const badgeText = computed(() => {
  if (installRunning.value) return actionLabel.value === "Update" ? "Updating" : "Installing";
  if (installError.value && !isInstalled.value) return "Install Failed";
  if (hasUpdateAvailable.value) return "Update Available";
  if (isInstalled.value) return "Installed";
  return "Available";
});

const badgeVariant = computed(() => {
  const label = badgeText.value.toLowerCase();
  if (label === "installed") return "success";
  if (label === "update available") return "warning";
  if (label === "installing" || label === "updating") return "info";
  if (label === "install failed") return "error";
  return "neutral";
});

function resolveAppIcon(icon) {
  if (!icon) return "mdi-package-variant-closed";
  return icon.startsWith("mdi-") ? icon : `mdi-${icon}`;
}

function clearPolling() {
  if (!pollTimer) return;
  clearTimeout(pollTimer);
  pollTimer = null;
}

async function loadData() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const [appsResponse, updatesResponse] = await Promise.all([
      getAppsCatalog(),
      checkUpdates(),
    ]);
    apps.value = Array.isArray(appsResponse.data?.apps) ? appsResponse.data.apps : [];
    updateComponents.value = Array.isArray(updatesResponse.data?.components)
      ? updatesResponse.data.components
      : [];
    if (app.value?.defaultPort && !installPort.value) {
      installPort.value = String(app.value.defaultPort);
    }
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}

async function fetchLog() {
  if (!jobId.value) return;
  try {
    const response = await getAppJobLog(jobId.value, 200);
    installLog.value = response.data?.content || installLog.value || "";
  } catch {
    // Keep last known content visible.
  }
}

async function pollInstall() {
  if (!jobId.value) return;

  try {
    const response = await getAppJobStatus(jobId.value);
    const status = response.data || {};
    await fetchLog();

    if (status.finished && !status.running) {
      installRunning.value = false;
      clearPolling();
      if (status.success === false || status.error) {
        installError.value = status.error || `${actionLabel.value} failed.`;
        showError(installError.value);
      } else {
        installError.value = "";
        success(`${app.value?.displayName || app.value?.name} ${actionLabel.value.toLowerCase()} finished`);
      }
      await loadData();
      return;
    }
  } catch (error) {
    installError.value = error.message;
  }

  clearPolling();
  pollTimer = setTimeout(pollInstall, INSTALL_POLL_MS);
}

async function runAppAction() {
  if (!app.value || installRunning.value) return;

  installRunning.value = true;
  installError.value = "";
  installLog.value = "";
  jobId.value = "";
  actionLabel.value = isInstalled.value && hasUpdateAvailable.value ? "Update" : "Install";

  const payload = {};
  if (!isInstalled.value && app.value.customPort && installPort.value.trim()) {
    payload.port = Number(installPort.value);
  }

  try {
    const response = await installApp(app.value.name, payload);
    const result = response.data || {};
    if (!result.job_id) {
      installRunning.value = false;
      installError.value = result.error || `${actionLabel.value} did not return a job id.`;
      return;
    }
    jobId.value = String(result.job_id);
    await pollInstall();
  } catch (error) {
    installRunning.value = false;
    installError.value = error.message;
    showError(`Failed to start ${actionLabel.value.toLowerCase()}: ${error.message}`);
  }
}

onMounted(loadData);
onUnmounted(clearPolling);
</script>

<style scoped>
.detail-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-log-panel {
  background: color-mix(in srgb, var(--app-surface-strong) 80%, transparent);
  border-radius: 8px;
  max-height: 280px;
  overflow: auto;
  padding: 10px;
}

.detail-log-content {
  font-family: "Courier New", monospace;
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

@media (max-width: 600px) {
  .detail-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
