<template>
  <v-app>
    <v-main class="login-background d-flex align-center justify-center">
      <v-card class="login-card pa-8" max-width="420" width="100%">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <div class="app-logo mx-auto mb-4">
            <v-icon size="40" color="primary">mdi-tree</v-icon>
          </div>
          <h1 class="text-h5 font-weight-bold">Wood Library</h1>
          <p class="text-body-2 text-secondary mt-2">Admin Portal</p>
        </div>

        <!-- Error Alert -->
        <v-alert
          v-if="authError"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-6"
          closable
          @click:close="clearError"
        >
          {{ authError }}
        </v-alert>

        <!-- Login Form -->
        <v-form ref="formRef" @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              Email
            </label>
            <v-text-field
              v-model="email"
              type="email"
              placeholder="admin@example.com"
              :rules="[rules.required, rules.email]"
              prepend-inner-icon="mdi-email-outline"
              hide-details="auto"
              :disabled="isLoading"
            />
          </div>

          <div class="mb-6">
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              Mật khẩu
            </label>
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :rules="[rules.required]"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              hide-details="auto"
              :disabled="isLoading"
            />
          </div>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="isLoading"
          >
            Đăng nhập
          </v-btn>
        </v-form>

        <!-- Footer -->
        <p class="text-caption text-secondary text-center mt-8">
          © 2026 Wood Library. All rights reserved.
        </p>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import type { VForm } from 'vuetify/components'

const router = useRouter()
const { signIn, isLoading, authError, clearError } = useAuth()

const formRef = ref<VForm | null>(null)
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const rules = {
  required: (v: string) => !!v || 'Trường này là bắt buộc',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
}

async function handleLogin() {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const success = await signIn(email.value, password.value)
  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
.login-background {
  background-color: #f5f6f8; /* xám rất nhẹ */
  min-height: 100vh;
}

.login-card {
  background-color: #ffffff;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid #e5e7eb;
}

.app-logo {
  width: 72px;
  height: 72px;
  background-color: #f3f4f6;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>