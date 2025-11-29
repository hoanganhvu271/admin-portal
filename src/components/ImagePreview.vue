<template>
  <div
    class="image-preview"
    :class="{ 'image-preview--empty': !src }"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <v-img
      v-if="src"
      :src="src"
      cover
      class="rounded-lg"
      :width="size"
      :height="size"
    >
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular indeterminate color="secondary" size="24" />
        </div>
      </template>
    </v-img>

    <div v-else class="empty-placeholder d-flex align-center justify-center fill-height">
      <v-icon color="secondary" size="24">mdi-image-outline</v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  src?: string
  size?: number
}>(), {
  size: 60
})
</script>

<style scoped>
.image-preview {
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.image-preview--empty {
  background: #F5F5F5;
  border: 1px solid #E8E8E8;
}

.empty-placeholder {
  width: 100%;
  height: 100%;
}
</style>