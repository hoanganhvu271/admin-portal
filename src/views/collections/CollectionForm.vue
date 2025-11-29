<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card>
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-4">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? 'Chỉnh sửa Collection' : 'Tạo Collection mới' }}
        </span>
        <v-btn icon variant="text" size="small" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <!-- Form -->
      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="save">
          <!-- ID Field -->
          <div class="mb-5">
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              ID <span class="text-error">*</span>
            </label>
            <v-text-field
              v-model="form.id"
              placeholder="VD: vn_26"
              :rules="[rules.required]"
              :disabled="isEdit"
              hide-details="auto"
            />
            <p class="text-caption text-secondary mt-1">
              ID duy nhất, không thể thay đổi sau khi tạo
            </p>
          </div>

          <!-- Title Field -->
          <div class="mb-5">
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              Tên Collection <span class="text-error">*</span>
            </label>
            <v-text-field
              v-model="form.title"
              placeholder="VD: Gỗ Việt Nam"
              :rules="[rules.required]"
              hide-details="auto"
            />
          </div>

          <!-- Size Field -->
          <div class="mb-5">
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              Số lượng mẫu
            </label>
            <v-text-field
              v-model.number="form.size"
              type="number"
              placeholder="0"
              min="0"
              hide-details="auto"
            />
          </div>

          <!-- Description Field -->
          <div class="mb-5">
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              Mô tả
            </label>
            <v-textarea
              v-model="form.description"
              placeholder="Mô tả ngắn về bộ sưu tập..."
              rows="3"
              hide-details="auto"
            />
          </div>

          <!-- Image Upload -->
          <div>
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              Ảnh đại diện
            </label>

            <div class="d-flex align-start ga-4">
              <!-- Preview -->
              <div class="image-upload-preview">
                <v-img
                  v-if="form.image || previewUrl"
                  :src="previewUrl || form.image"
                  width="120"
                  height="120"
                  cover
                  class="rounded-lg"
                />
                <div v-else class="empty-preview d-flex align-center justify-center">
                  <v-icon size="32" color="secondary">mdi-image-outline</v-icon>
                </div>
              </div>

              <!-- Upload Input -->
              <div class="flex-grow-1">
                <v-file-input
                  v-model="imageFile"
                  accept="image/*"
                  label="Chọn ảnh"
                  prepend-icon=""
                  prepend-inner-icon="mdi-upload"
                  hide-details="auto"
                  @update:model-value="handleImageChange"
                />
                <p class="text-caption text-secondary mt-2">
                  Hỗ trợ: JPG, PNG, GIF. Tối đa 5MB
                </p>
              </div>
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-divider />

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-4">
        <v-spacer />
        <v-btn variant="text" color="secondary" @click="close">
          Hủy
        </v-btn>
        <v-btn color="primary" :loading="saving" @click="save">
          {{ isEdit ? 'Cập nhật' : 'Tạo mới' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { uploadImage, type WoodDatabase } from '@/api'
import type { VForm } from 'vuetify/components'

const props = defineProps<{
  modelValue: boolean
  collection: WoodDatabase | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: WoodDatabase]
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.collection)

const formRef = ref<VForm | null>(null)
const saving = ref(false)

const imageFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const form = ref<WoodDatabase>({
  id: '',
  title: '',
  size: 0,
  description: '',
  image: ''
})

const rules = {
  required: (v: string) => !!v || 'Trường này là bắt buộc'
}

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.collection) {
      form.value = { ...props.collection }
      previewUrl.value = props.collection.image || null
    } else {
      form.value = {
        id: '',
        title: '',
        size: 0,
        description: '',
        image: ''
      }
      previewUrl.value = null
    }

    imageFile.value = null
  }
})

function handleImageChange(value: any) {
  let file: File | null = null

  if (value instanceof File) {
    file = value
  } else if (Array.isArray(value) && value.length > 0) {
    file = value[0]
  } else {
    previewUrl.value = null
    imageFile.value = null
    return
  }

  imageFile.value = file

  // Clear old preview
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)

  previewUrl.value = URL.createObjectURL(file)
}

async function save() {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    if (imageFile.value) {
      const url = await uploadImage(imageFile.value)
      form.value.image = url
    }

    emit('save', { ...form.value })
  } catch (error) {
    console.error('Error saving:', error)
  } finally {
    saving.value = false
  }
}

function close() {
  dialog.value = false
}
</script>
