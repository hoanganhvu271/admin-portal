<template>
  <div class="page-header mb-6">
    <div class="d-flex align-center justify-space-between flex-wrap ga-4">
      <div>
        <div class="d-flex align-center mb-1">
          <v-btn
            v-if="backTo"
            icon
            variant="text"
            size="small"
            class="mr-2"
            :to="backTo"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
        </div>
        <p v-if="subtitle" class="text-body-2 text-secondary mt-1">{{ subtitle }}</p>
      </div>

      <div class="d-flex align-center ga-3">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  backTo?: string
}>()
</script>

<style scoped>
.page-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #E8E8E8;
}
</style>