<template>
  <v-dialog v-model="dialog" max-width="400" persistent>
    <v-card class="pa-2">
      <v-card-title class="text-h6 font-weight-bold pt-4 px-6">
        {{ title }}
      </v-card-title>

      <v-card-text class="px-6 text-body-1">
        {{ message }}
      </v-card-text>

      <v-card-actions class="pa-6 pt-2">
        <v-spacer />
        <v-btn
          variant="text"
          color="secondary"
          @click="cancel"
        >
          Hủy
        </v-btn>
        <v-btn
          :color="confirmColor"
          :loading="loading"
          @click="confirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  message?: string
  confirmText?: string
  confirmColor?: string
}>(), {
  title: 'Xác nhận',
  message: 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText: 'Xác nhận',
  confirmColor: 'error'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const dialog = ref(false)
const loading = ref(false)

function open() {
  dialog.value = true
}

function close() {
  dialog.value = false
  loading.value = false
}

function cancel() {
  emit('cancel')
  close()
}

function confirm() {
  emit('confirm')
}

function setLoading(value: boolean) {
  loading.value = value
}

defineExpose({ open, close, setLoading })
</script>