<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar elevation="0" color="white" border="b">
      <v-container class="d-flex align-center py-0" style="max-width: 1400px;">
        <router-link to="/" class="d-flex align-center text-decoration-none">
          <div class="app-logo mr-3">
            <v-icon size="24" color="primary">mdi-tree</v-icon>
          </div>
          <span class="text-h6 font-weight-bold text-primary">Wood Library</span>
        </router-link>

        <v-spacer />

        <v-breadcrumbs
          v-if="breadcrumbs.length > 1"
          :items="breadcrumbs"
          density="compact"
          class="pa-0"
        >
          <template v-slot:divider>
            <v-icon size="small">mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </v-container>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-background">
      <v-container style="max-width: 1400px;" class="py-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const items = [
    { title: 'Collections', to: '/', disabled: false }
  ]

  if (route.name === 'Pieces') {
    items.push({
      title: `Collection: ${route.params.id}`,
      to: route.fullPath,
      disabled: true
    })
  }

  return items
})
</script>

<style scoped>
.app-logo {
  width: 40px;
  height: 40px;
  background: #F5F5F5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>