<template>
  <v-dialog v-model="dialog" max-width="700" persistent>
    <v-card>
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-4">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? 'Chỉnh sửa mẫu gỗ' : 'Thêm mẫu gỗ mới' }}
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
        <div v-if="isEdit" class="mb-5">
          <label class="text-body-2 font-weight-medium mb-2 d-block">
            ID
          </label>
          <v-text-field
            v-model="form.id"
            :disabled="true"
            :rules="isEdit ? [rules.required] : []"
            hide-details="auto"
          />
          <p class="text-caption text-secondary mt-1">
            ID duy nhất, không thể thay đổi sau khi tạo
          </p>
        </div>

          <!-- Name Field -->
          <div class="mb-5">
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              Tên mẫu gỗ <span class="text-error">*</span>
            </label>
            <v-text-field
              v-model="form.name"
              placeholder="VD: Gỗ Sưa"
              :rules="[rules.required]"
              hide-details="auto"
            />
          </div>

          <!-- Description Field -->
          <div class="mb-5">
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              Mô tả (hỗ trợ HTML)
            </label>
            <QuillEditor
              v-model:content="form.description" contentType="html" theme="snow"
              :options="quillOptions"
              style="height: 300px;"
              :key="dialog"
            />
          </div>

          <!-- Images Section -->
          <div>
            <label class="text-body-2 font-weight-medium mb-3 d-block">
              Hình ảnh (tối đa 3 ảnh)
            </label>

            <!-- Current Images -->
            <div v-if="currentImages.length > 0" class="mb-4">
              <p class="text-caption text-secondary mb-2">Ảnh hiện tại:</p>
              <div class="d-flex flex-wrap ga-3">
                <div
                  v-for="(url, idx) in currentImages"
                  :key="idx"
                  class="image-item"
                >
                  <v-img
                    :src="url"
                    width="100"
                    height="100"
                    cover
                    class="rounded-lg"
                  />
                  <v-btn
                    icon
                    size="x-small"
                    color="error"
                    class="remove-btn"
                    @click="removeCurrentImage(idx)"
                  >
                    <v-icon size="14">mdi-close</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- New Images Preview -->
            <div v-if="newImagePreviews.length > 0" class="mb-4">
              <p class="text-caption text-secondary mb-2">Ảnh mới:</p>
              <div class="d-flex flex-wrap ga-3">
                <div
                  v-for="(url, idx) in newImagePreviews"
                  :key="idx"
                  class="image-item"
                >
                  <v-img
                    :src="url"
                    width="100"
                    height="100"
                    cover
                    class="rounded-lg"
                  />
                  <v-btn
                    icon
                    size="x-small"
                    color="error"
                    class="remove-btn"
                    @click="removeNewImage(idx)"
                  >
                    <v-icon size="14">mdi-close</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- Upload Input -->
            <v-file-input
              v-if="totalImages < 3"
              accept="image/*"
              :label="`Thêm ảnh (còn ${3 - totalImages} slot)`"
              prepend-icon=""
              prepend-inner-icon="mdi-upload"
              hide-details="auto"
              multiple
              @update:model-value="handleNewImages"
            />


            <v-alert
              v-else
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2"
            >
              Đã đạt giới hạn 3 ảnh
            </v-alert>
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
import { uploadImage, type WoodPiece } from '@/api'
import type { VForm } from 'vuetify/components'

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps<{
  modelValue: boolean
  piece: WoodPiece | null
  databaseId: string
  isEdit: boolean
}>()

const quillOptions = {
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'image', 'code-block'],
            ['clean']
        ]
    }
}

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: WoodPiece]
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<VForm | null>(null)
const saving = ref(false)

const form = ref({
  id: '',
  name: '',
  description: ''
})

const currentImages = ref<string[]>([])
const newImages = ref<File[]>([])
const newImagePreviews = ref<string[]>([])

const totalImages = computed(() => currentImages.value.length + newImagePreviews.value.length)

const rules = {
  required: (v: string) => !!v || 'Trường này là bắt buộc'
}

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.piece) {
      form.value = {
        id: props.piece.id,
        name: props.piece.name,
        description: props.piece.description || ''
      }
      currentImages.value = [...(props.piece.image_urls || [])]
    } else {
      form.value = {
        id: '',
        name: '',
        description: ''
      }
      currentImages.value = []
    }
    newImages.value = []
    newImagePreviews.value = []
  }
})

function handleNewImages(files: File[]) {
  if (!files || files.length === 0) return;

  const available = 3 - (currentImages.value.length + newImages.value.length);

  if (available <= 0) return;

  const toAdd = Array.from(files).slice(0, available);

  newImages.value.push(...toAdd);

  toAdd.forEach(file => {
    const url = URL.createObjectURL(file);
    newImagePreviews.value.push(url);
  });
}

function removeCurrentImage(index: number) {
  currentImages.value.splice(index, 1)
}

function removeNewImage(index: number) {
  URL.revokeObjectURL(newImagePreviews.value[index])
  newImages.value.splice(index, 1)
  newImagePreviews.value.splice(index, 1)
}

async function save() {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true

  try {
    const uploadedUrls: string[] = []
    for (const file of newImages.value) {
      const url = await uploadImage(file)
      uploadedUrls.push(url)
    }

    const allImages = [...currentImages.value, ...uploadedUrls]

    const data: WoodPiece = {
      database_id: props.databaseId,
      name: form.value.name,
      description: form.value.description,
      image_urls: allImages,
      ...(props.isEdit && { id: form.value.id })
    }

    emit('save', data)
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

<style scoped>
.image-item {
  position: relative;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
}
</style>