<template>
  <v-container class="pa-4 pa-md-6" fluid>
    <router-view v-if="!isOverviewRoute" />

    <template v-else>
      <div class="mb-6 d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center ga-3">
        <div>
          <h1 class="text-h4 text-md-h3 text-primary-high font-weight-bold mb-1">
            Apps
          </h1>
          <p class="text-body-2 text-secondary">
            Installable applications from the deployment catalog
          </p>
        </div>
        <v-btn
          color="primary"
          :loading="loading"
          prepend-icon="mdi-refresh"
          variant="outlined"
          @click="refreshPageData({ forceUpdates: true })"
        >
          Refresh
        </v-btn>
      </div>

      <div v-if="loading && apps.length === 0" class="text-center py-16">
        <v-progress-circular color="primary" indeterminate size="64" />
        <div class="text-body-1 text-secondary mt-4">Loading app catalog...</div>
      </div>

      <v-alert
        v-else-if="loadError && apps.length === 0"
        class="mb-6"
        icon="mdi-alert-circle"
        prominent
        type="error"
        variant="tonal"
      >
        <div class="text-h6 mb-2">Apps Unavailable</div>
        <div class="text-body-2">{{ loadError }}</div>
        <template #append>
          <v-btn color="error" variant="outlined" @click="refreshPageData({ forceUpdates: true })">
            Retry
          </v-btn>
        </template>
      </v-alert>

      <template v-else>
        <v-alert
          v-if="loadError"
          class="mb-4"
          density="comfortable"
          icon="mdi-alert"
          type="warning"
          variant="tonal"
        >
          {{ loadError }}
        </v-alert>

        <v-row v-if="appCards.length">
          <v-col
            v-for="app in appCards"
            :key="app.name"
            cols="12"
            lg="4"
            md="6"
          >
            <glass-card class="h-100">
              <v-card-text>
                <div class="d-flex justify-space-between align-start mb-4 ga-3">
                  <div class="d-flex align-center ga-3 min-w-0">
                    <v-avatar color="primary" size="48" variant="tonal">
                      <v-icon :icon="resolveAppIcon(app.icon)" />
                    </v-avatar>
                    <div class="min-w-0">
                      <div class="text-h6 text-primary-high font-weight-bold text-truncate">
                        {{ app.displayName }}
                      </div>
                      <div class="text-caption text-secondary">
                        {{ formatAppType(app.type) }} app
                      </div>
                    </div>
                  </div>
                  <status-badge :variant="getAppBadgeVariant(app)">
                    {{ getAppBadgeText(app) }}
                  </status-badge>
                </div>

                <div class="text-body-2 text-secondary mb-4">
                  {{ app.description || "No description provided in catalog." }}
                </div>

                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-chip size="small" variant="tonal">
                    {{ app.name }}
                  </v-chip>
                  <v-chip size="small" variant="outlined">
                    {{ app.repo }}
                  </v-chip>
                  <v-chip v-if="app.serviceName" size="small" variant="outlined">
                    {{ app.serviceName }}
                  </v-chip>
                  <v-chip
                    v-if="app.defaultPort"
                    size="small"
                    variant="outlined"
                  >
                    Port {{ app.defaultPort }}
                  </v-chip>
                </div>

                <div class="app-meta-grid mb-4">
                  <div>
                    <div class="text-caption text-secondary">Installed</div>
                    <div class="text-body-2 text-primary-high font-weight-medium">
                      {{ getInstalledVersion(app) || "Not installed" }}
                    </div>
                  </div>
                  <div>
                    <div class="text-caption text-secondary">Latest</div>
                    <div class="text-body-2 text-primary-high font-weight-medium">
                      {{ getLatestVersion(app) || "Unknown" }}
                    </div>
                  </div>
                  <div>
                    <div class="text-caption text-secondary">Updates</div>
                    <div class="text-body-2 text-primary-high font-weight-medium">
                      {{ app.hasUpdate ? "Available" : "Current" }}
                    </div>
                  </div>
                  <div>
                    <div class="text-caption text-secondary">Components</div>
                    <div class="text-body-2 text-primary-high font-weight-medium">
                      {{ app.components.length }}
                    </div>
                  </div>
                </div>

                <div v-if="app.components.length" class="mb-4">
                  <div class="text-caption text-secondary mb-2">Catalog components</div>
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-for="component in app.components"
                      :key="`${app.name}-${component.kind}`"
                      :color="component.update_available ? 'warning' : undefined"
                      size="small"
                      variant="tonal"
                    >
                      {{ formatComponentLabel(component) }}
                    </v-chip>
                  </div>
                </div>

                <div v-if="app.customPort && !hasInstalledComponent(app)" class="mb-3">
                  <v-text-field
                    v-model="installFormByApp[app.name].port"
                    density="comfortable"
                    hint="Leave empty to use the catalog default port."
                    label="Custom port"
                    persistent-hint
                    type="number"
                    variant="outlined"
                  />
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <v-btn
                    v-if="!hasInstalledComponent(app)"
                    color="primary"
                    :disabled="isInstalling(app.name)"
                    :loading="isInstalling(app.name)"
                    prepend-icon="mdi-download"
                    @click="runAppAction(app)"
                  >
                    Install
                  </v-btn>
                  <v-btn
                    v-if="hasInstalledComponent(app) && app.hasUpdate"
                    color="warning"
                    :disabled="isInstalling(app.name)"
                    :loading="isInstalling(app.name)"
                    prepend-icon="mdi-update"
                    @click="runAppAction(app)"
                  >
                    Update
                  </v-btn>
                  <v-btn
                    color="secondary"
                    :disabled="!getJobState(app.name)?.jobId"
                    prepend-icon="mdi-text-box-search"
                    variant="outlined"
                    @click="fetchInstallLog(app.name)"
                  >
                    Refresh log
                  </v-btn>
                  <v-btn
                    v-if="app.ui?.route"
                    color="info"
                    prepend-icon="mdi-open-in-new"
                    variant="outlined"
                    @click="router.push(app.ui.route)"
                  >
                    Open
                  </v-btn>
                </div>

                <div v-if="getJobState(app.name)?.error" class="mt-4">
                  <v-alert density="comfortable" type="error" variant="tonal">
                    {{ getJobState(app.name)?.error }}
                  </v-alert>
                </div>

                <div v-if="getJobState(app.name)?.jobId" class="mt-4">
                  <div class="text-caption text-secondary mb-2">
                    {{ getJobState(app.name)?.actionLabel }} job {{ getJobState(app.name)?.jobId }}
                  </div>
                  <div class="app-log-panel">
                    <pre class="app-log-content">{{
                      getJobState(app.name)?.logs || "Waiting for installer output..."
                    }}</pre>
                  </div>
                </div>
              </v-card-text>
            </glass-card>
          </v-col>
        </v-row>

        <glass-card v-else>
          <v-card-text>
            <div class="text-h6 text-primary-high mb-2">No catalog apps returned</div>
            <div class="text-body-2 text-secondary">
              The frontend is now reading app definitions from <code>/api/apps</code>.
            </div>
          </v-card-text>
        </glass-card>
      </template>
    </template>
  </v-container>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import GlassCard from "@/components/GlassCard.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import { useToast } from "@/composables/useToast";
import {
  checkUpdates,
  getAppJobLog,
  getAppJobStatus,
  getAppsCatalog,
  getUpdates,
  installApp,
} from "@/services/api";

const INSTALL_POLL_MS = 1500;
const INSTALL_LOG_LINES = 200;

const route = useRoute();
const router = useRouter();
const { success, error: showError } = useToast();

const loading = ref(false);
const loadError = ref("");
const apps = ref([]);
const updatesData = ref(null);
const installFormByApp = reactive({});
const installJobsByApp = reactive({});

const isOverviewRoute = computed(() => route.path === "/apps");

function ensureInstallForm(appName, app = {}) {
  if (!installFormByApp[appName]) {
    installFormByApp[appName] = {
      port: app.defaultPort ? String(app.defaultPort) : "",
    };
  }
}

function ensureJobState(appName) {
  if (!installJobsByApp[appName]) {
    installJobsByApp[appName] = {
      jobId: "",
      logs: "",
      error: "",
      running: false,
      timerId: null,
      actionLabel: "Install",
    };
  }
  return installJobsByApp[appName];
}

const appCards = computed(() => {
  const componentsByApp = new Map();
  for (const component of updatesData.value?.components || []) {
    const appName = component.app || component.name;
    if (!componentsByApp.has(appName)) {
      componentsByApp.set(appName, []);
    }
    componentsByApp.get(appName).push(component);
  }

  return apps.value.map((app) => {
    ensureInstallForm(app.name, app);
    const components = componentsByApp.get(app.name) || [];
    const hasUpdate = components.some((component) => component.update_available);
    return {
      ...app,
      components,
      hasUpdate,
    };
  });
});

function getJobState(appName) {
  return installJobsByApp[appName] || null;
}

function isInstalling(appName) {
  return !!getJobState(appName)?.running;
}

function hasInstalledComponent(app) {
  return app.components.some((component) => {
    const version = String(component.current_version || "").trim().toLowerCase();
    return version && version !== "unknown" && version !== "not installed";
  });
}

function getInstalledVersion(app) {
  const component = app.components.find((item) => {
    const version = String(item.current_version || "").trim().toLowerCase();
    return version && version !== "unknown" && version !== "not installed";
  });
  return component?.current_version || "";
}

function getLatestVersion(app) {
  return app.components.find((component) => component.latest_version)?.latest_version || "";
}

function getAppBadgeText(app) {
  if (isInstalling(app.name)) {
    return getJobState(app.name)?.actionLabel === "Update" ? "Updating" : "Installing";
  }
  if (getJobState(app.name)?.error && !hasInstalledComponent(app)) return "Install Failed";
  if (app.hasUpdate) return "Update Available";
  if (hasInstalledComponent(app)) return "Installed";
  return "Available";
}

function getAppBadgeVariant(app) {
  const label = getAppBadgeText(app).toLowerCase();
  if (label === "installed") return "success";
  if (label === "update available") return "warning";
  if (label === "installing" || label === "updating") return "info";
  if (label === "install failed") return "error";
  return "neutral";
}

function resolveAppIcon(icon) {
  if (!icon) return "mdi-package-variant-closed";
  return icon.startsWith("mdi-") ? icon : `mdi-${icon}`;
}

function formatAppType(type) {
  return String(type || "app").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatComponentLabel(component) {
  const label = component.kind === "frontend" ? "Frontend" : "Backend";
  const currentVersion = component.current_version || "unknown";
  const latestVersion = component.latest_version || "unknown";
  return `${label}: ${currentVersion} -> ${latestVersion}`;
}

function clearInstallPolling(appName) {
  const state = getJobState(appName);
  if (!state?.timerId) return;
  clearTimeout(state.timerId);
  state.timerId = null;
}

function getActionLabel(app) {
  return hasInstalledComponent(app) && app.hasUpdate ? "Update" : "Install";
}

async function fetchCatalog() {
  const response = await getAppsCatalog();
  const appList = Array.isArray(response.data?.apps) ? response.data.apps : [];
  apps.value = appList;
  for (const app of appList) {
    ensureInstallForm(app.name, app);
    ensureJobState(app.name);
  }
}

async function fetchUpdates({ force = false } = {}) {
  const response = force ? await checkUpdates() : await getUpdates();
  updatesData.value = response.data || null;
}

async function refreshPageData({ forceUpdates = false } = {}) {
  loading.value = true;
  loadError.value = "";
  try {
    await Promise.all([fetchCatalog(), fetchUpdates({ force: forceUpdates })]);
  } catch (error) {
    loadError.value = error.message;
  } finally {
    loading.value = false;
  }
}

async function fetchInstallLog(appName) {
  const state = ensureJobState(appName);
  if (!state.jobId) return;

  try {
    const response = await getAppJobLog(state.jobId, INSTALL_LOG_LINES);
    state.logs = response.data?.content || state.logs || "";
  } catch {
  }
}

async function pollInstall(appName) {
  const state = ensureJobState(appName);
  if (!state.jobId) return;

  try {
    const response = await getAppJobStatus(state.jobId);
    const status = response.data || {};
    state.running = !!status.running && !status.finished;
    await fetchInstallLog(appName);

    if (status.finished && !status.running) {
      clearInstallPolling(appName);
      state.running = false;
      if (status.success === false || status.error) {
        state.error = status.error || `${state.actionLabel} failed.`;
        showError(`${appName} ${state.actionLabel.toLowerCase()} failed: ${state.error}`);
      } else {
        state.error = "";
        success(`${appName} ${state.actionLabel.toLowerCase()} finished`);
      }
      await refreshPageData({ forceUpdates: true });
      return;
    }
  } catch (error) {
    state.error = error.message;
  }

  clearInstallPolling(appName);
  state.timerId = setTimeout(() => pollInstall(appName), INSTALL_POLL_MS);
}

async function runAppAction(app) {
  const state = ensureJobState(app.name);
  if (state.running) return;

  state.error = "";
  state.logs = "";
  state.jobId = "";
  state.running = true;
  state.actionLabel = getActionLabel(app);

  const payload = {};
  const form = installFormByApp[app.name];
  if (!hasInstalledComponent(app) && app.customPort && form?.port?.trim()) {
    payload.port = Number(form.port);
  }

  try {
    const response = await installApp(app.name, payload);
    const result = response.data || {};
    if (!result.job_id) {
      state.running = false;
      state.error = result.error || `${state.actionLabel} did not return a job id.`;
      return;
    }

    state.jobId = String(result.job_id);
    state.logs = "";
    await pollInstall(app.name);
  } catch (error) {
    state.running = false;
    state.error = error.message;
    showError(`Failed to start ${app.displayName} ${state.actionLabel.toLowerCase()}: ${error.message}`);
  }
}

onMounted(async () => {
  await refreshPageData();
});

onUnmounted(() => {
  for (const appName of Object.keys(installJobsByApp)) {
    clearInstallPolling(appName);
  }
});
</script>

<style scoped>
.app-meta-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.app-log-panel {
  background: color-mix(in srgb, var(--app-surface-strong) 80%, transparent);
  border-radius: 8px;
  max-height: 220px;
  overflow: auto;
  padding: 10px;
}

.app-log-content {
  font-family: "Courier New", monospace;
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.min-w-0 {
  min-width: 0;
}

@media (max-width: 600px) {
  .app-meta-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
