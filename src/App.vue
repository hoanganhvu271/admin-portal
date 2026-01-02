<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar v-if="isAuthenticated" elevation="0" color="white" border="b">
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

        <v-spacer />

        <!-- User Menu -->
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="text-none"
            >
              <v-avatar size="32" color="primary" class="mr-2">
                <v-icon size="20" color="white">mdi-account</v-icon>
              </v-avatar>
              <span class="d-none d-sm-inline">{{ userEmail }}</span>
              <v-icon end>mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list density="compact" min-width="200">
            <v-list-item>
              <v-list-item-title class="text-caption text-secondary">
                Đăng nhập với
              </v-list-item-title>
              <v-list-item-subtitle class="font-weight-medium">
                {{ userEmail }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item @click="handleSignOut" class="text-error">
              <template v-slot:prepend>
                <v-icon size="20">mdi-logout</v-icon>
              </template>
              <v-list-item-title>Đăng xuất</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-container>
    </v-app-bar>

    <!-- Main Content -->
    <v-main :class="{ 'bg-background': isAuthenticated }">
      <v-container v-if="isAuthenticated" style="max-width: 1400px;" class="py-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
      
      <!-- Login page doesn't need container -->
      <router-view v-else />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, signOut } = useAuth()

const userEmail = computed(() => user.value?.email || '')

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

async function handleSignOut() {
  await signOut()
  router.push('/login')
}
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