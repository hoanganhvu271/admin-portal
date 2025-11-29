<template>
  <div class="empty-state text-center py-16">
    <div class="empty-icon mb-4">
      <v-icon size="48" color="secondary">{{ icon }}</v-icon>
    </div>
    <h3 class="text-h6 font-weight-medium mb-2">{{ title }}</h3>
    <p class="text-body-2 text-secondary mb-6" style="max-width: 300px; margin: 0 auto;">
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<style scoped>
.empty-state {
  background: #FAFAFA;
  border-radius: 16px;
  border: 2px dashed #E0E0E0;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
</style>