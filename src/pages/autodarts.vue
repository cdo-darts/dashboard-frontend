<template>
  <v-container class="pa-4 pa-md-6" fluid>
    <glass-card>
      <v-card-text class="text-center py-10">
        <v-progress-circular class="mb-4" color="primary" indeterminate />
        <div class="text-h6 text-primary-high">Redirecting to Apps → Autodarts...</div>
      </v-card-text>
    </glass-card>
  </v-container>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import GlassCard from '@/components/GlassCard.vue'

  const router = useRouter()

  onMounted(() => {
    router.replace('/apps/autodarts')
  })
</script>
