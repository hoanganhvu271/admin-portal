<template>
  <v-dialog v-model="internalDialog" max-width="750">
    <v-card>
      <v-card-title class="d-flex align-center bg-primary text-white pa-4">
        <v-icon class="mr-3">mdi-hammer-wrench</v-icon>
        <span class="text-h6">
          {{ isEdit ? 'Sửa Wood Piece' : 'Thêm Wood Piece' }}
        </span>
      </v-card-title>

      <v-card-text class="pt-6">
        <v-form ref="formRef" lazy-validation>
          <v-text-field
            v-model="form.name"
            label="Tên mẫu gỗ (Name)"
            required
            :rules="[v => !!v || 'Tên không được để trống']"
            variant="outlined"
            density="compact"
            class="mb-4"
            prepend-inner-icon="mdi-format-title"
          />

          <v-textarea
            v-model="form.description"
            label="Mô tả (Description - Hỗ trợ HTML)"
            rows="4"
            variant="outlined"
            density="compact"
            class="mb-4"
            prepend-inner-icon="mdi-text-box-outline"
          />

          <v-card class="pa-4 mb-6" variant="outlined">
            <div class="text-subtitle-1 mb-2 font-weight-bold">
              <v-icon class="mr-2">mdi-image-multiple</v-icon> Hình ảnh (Tối đa 3)
            </div>

            <v-alert
              type="info"
              density="compact"
              variant="tonal"
              class="mb-4"
              icon="mdi-information-outline"
            >
              Bạn có thể tải lên tối đa **3 ảnh** mới hoặc giữ lại các ảnh đã có.
            </v-alert>

            <v-file-input
              v-model="form.newImages"
              multiple
              accept="image/*"
              label="Chọn ảnh mới"
              clearable
              variant="outlined"
              density="compact"
              :rules="[maxImagesRule]"
              class="mb-4"
            />

            <v-row v-if="previewList.length">
              <v-col
                v-for="(url, idx) in previewList"
                :key="idx"
                cols="12"
                sm="4"
              >
                <v-card class="pa-2" elevation="2">
                  <v-img :src="url" height="100" cover class="rounded" />
                  <v-btn
                    size="small"
                    color="error"
                    variant="flat"
                    class="mt-2 w-100"
                    @click="removePreview(idx)"
                  >
                    <v-icon left>mdi-delete</v-icon> Xóa
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
            <v-card-text
              v-else
              class="text-center text-medium-emphasis"
              style="font-style: italic"
            >
              Chưa có hình ảnh nào được chọn.
            </v-card-text>
          </v-card>
        </v-form>
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="tonal"
          color="grey-darken-1"
          @click="close"
          prepend-icon="mdi-close"
        >
          Hủy
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="validateAndSave"
          :loading="loading"
          prepend-icon="mdi-content-save"
        >
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue'
import type { WoodPiece } from '@/models/wood'
import { VForm } from 'vuetify/components'

export default defineComponent({
  props: {
    modelValue: Boolean,
    item: Object as () => WoodPiece | null,
    databaseId: String,
  },
  emits: ['update:modelValue', 'save'],

  setup(props, { emit }) {
    const internalDialog = ref(props.modelValue)
    const formRef = ref<VForm | null>(null) // Dùng để validate form
    const loading = ref(false) // Thêm trạng thái loading cho button

    const form = ref({
      id: '',
      name: '',
      description: '',
      image_urls: [] as string[],
      newImages: [] as File[],
    })

    const previewList = ref<string[]>([])

    // ... (watch logic giữ nguyên) ...
    watch(
      () => props.modelValue,
      (v) => {
        internalDialog.value = v

        if (v && props.item) {
          form.value = {
            id: props.item.id,
            name: props.item.name,
            description: props.item.description,
            image_urls: [...props.item.image_urls],
            newImages: [],
          }

          previewList.value = [...props.item.image_urls]
        } else if (v) {
          form.value = {
            id: '',
            name: '',
            description: '',
            image_urls: [],
            newImages: [],
          }
          previewList.value = []
        }
      }
    )

    watch(internalDialog, (v) => emit('update:modelValue', v))

    const maxImagesRule = (files: File[]) => {
      const existingCount = previewList.value.length
      const newCount = files?.length ?? 0
      return (existingCount + newCount) <= 3 || `Tổng cộng tối đa 3 ảnh. Hiện có ${existingCount} ảnh, không thể thêm ${newCount} ảnh.`
    }

    const isEdit = computed(() => !!props.item)

    const removePreview = (index: number) => {
      // Xóa cả trong list ảnh cũ và list preview
      if (index < form.value.image_urls.length) {
        form.value.image_urls.splice(index, 1) // Xóa khỏi list ảnh đã có
      }
      previewList.value.splice(index, 1) // Xóa khỏi list preview
    }

    const save = () => {
      emit('save', {
        id: form.value.id,
        name: form.value.name,
        description: form.value.description,
        database_id: props.databaseId,
        image_urls: previewList.value.filter(url => !url.startsWith('blob:')), // Lọc bỏ blob URL của ảnh mới
        new_files: form.value.newImages,
      })
      internalDialog.value = false
      loading.value = false
    }

    const validateAndSave = async () => {
      if (formRef.value) {
        const { valid } = await formRef.value.validate()
        if (valid) {
          loading.value = true
          // Giả định logic save (bao gồm upload)
          // ...
          save()
        }
      }
    }

    return {
      internalDialog,
      form,
      previewList,
      maxImagesRule,
      isEdit,
      save,
      removePreview,
      formRef,
      loading,
      validateAndSave,
      close() {
        internalDialog.value = false
      },
    }
  },
})
</script>