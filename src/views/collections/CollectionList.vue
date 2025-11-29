<template>
  <div>
    <PageHeader
      title="Bộ sưu tập gỗ"
      subtitle="Quản lý các bộ sưu tập mẫu gỗ trong hệ thống"
    >
      <template #actions>
        <v-text-field
          v-model="search"
          placeholder="Tìm kiếm..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          density="compact"
          style="width: 250px;"
          clearable
          bg-color="surface-variant"
        />
        <v-btn color="primary" @click="openForm()">
          <v-icon start>mdi-plus</v-icon>
          Thêm Collection
        </v-btn>
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-16">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="collections.length === 0 && !search"
      icon="mdi-folder-multiple-outline"
      title="Chưa có bộ sưu tập nào"
      description="Bắt đầu bằng cách tạo bộ sưu tập gỗ đầu tiên của bạn"
    >
      <template #action>
        <v-btn color="primary" @click="openForm()">
          <v-icon start>mdi-plus</v-icon>
          Tạo Collection
        </v-btn>
      </template>
    </EmptyState>

    <!-- Data Table -->
    <v-card v-else class="mt-6">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="collections"
        :items-length="totalItems"
        :loading="loading"
        :search="search"
        @update:options="loadCollections"
        class="collection-table"
      >
        <!-- Image Column -->
        <template #item.image="{ item }">
          <div class="py-3">
            <ImagePreview :src="item.image" :size="56" />
          </div>
        </template>

        <!-- Title Column -->
        <template #item.title="{ item }">
          <div>
            <span class="font-weight-medium">{{ item.title }}</span>
            <div class="text-caption text-secondary">ID: {{ item.id }}</div>
          </div>
        </template>

        <!-- Size Column -->
        <template #item.size="{ item }">
          <v-chip size="small" color="surface-variant" text-color="primary">
            {{ item.size }} mẫu
          </v-chip>
        </template>

        <!-- Description Column -->
        <template #item.description="{ item }">
          <span class="text-body-2 text-secondary text-truncate d-inline-block" style="max-width: 300px;">
            {{ item.description || '—' }}
          </span>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-tooltip text="Xem mẫu gỗ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  v-bind="props"
                  :to="`/collection/${item.id}/pieces`"
                >
                  <v-icon size="20">mdi-eye-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Chỉnh sửa" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  v-bind="props"
                  @click="openForm(item)"
                >
                  <v-icon size="20">mdi-pencil-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Xóa" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  v-bind="props"
                  @click="confirmDelete(item)"
                >
                  <v-icon size="20">mdi-delete-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- No Data -->
        <template #no-data>
          <div class="text-center py-8 text-secondary">
            <v-icon size="32" class="mb-2">mdi-magnify</v-icon>
            <p>Không tìm thấy kết quả phù hợp</p>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Collection Form Dialog -->
    <CollectionForm
      v-model="formDialog"
      :collection="selectedCollection"
      :is-edit="isEdit"
      @save="handleSave"
    />

    <!-- Delete Confirm Dialog -->
    <ConfirmDialog
      ref="deleteDialog"
      title="Xóa Collection"
      :message="`Bạn có chắc chắn muốn xóa '${collectionToDelete?.title}'? Hành động này không thể hoàn tác.`"
      confirm-text="Xóa"
      @confirm="handleDelete"
    />

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import CollectionForm from './CollectionForm.vue'
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  type WoodDatabase
} from '@/api'

const loading = ref(true)
const search = ref('')
const collections = ref<WoodDatabase[]>([])
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)

const formDialog = ref(false)
const selectedCollection = ref<WoodDatabase | null>(null)
const isEdit = ref(false)

const collectionToDelete = ref<WoodDatabase | null>(null)
const deleteDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const headers = [
  { title: '', key: 'image', sortable: false, width: '80px' },
  { title: 'Tên', key: 'title', sortable: true },
  { title: 'Số lượng', key: 'size', width: '120px', sortable: true },
  { title: 'Mô tả', key: 'description', sortable: false },
  { title: '', key: 'actions', sortable: false, width: '120px', align: 'end' as const },
]

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadCollections({ page: 1, itemsPerPage: itemsPerPage.value })
  }, 300)
})

async function loadCollections(options: { page: number; itemsPerPage: number; sortBy?: any[] }) {
  loading.value = true
  try {
    console.log("Get collection")
    const offset = (options.page - 1) * options.itemsPerPage
    const result = await getCollections({
      limit: options.itemsPerPage,
      offset: offset,
      order_by: options.sortBy?.[0]?.key || 'title',
      desc: options.sortBy?.[0]?.order === 'desc'
    })

    collections.value = result.data || []
    totalItems.value = result.total
  } catch (error) {
    showSnackbar('Không thể tải danh sách collection', 'error')
  } finally {
    loading.value = false
  }
}

function openForm(collection?: WoodDatabase) {
  selectedCollection.value = collection || null
  isEdit.value = !!collection
  formDialog.value = true
}

async function handleSave(data: WoodDatabase) {
  try {
    if (isEdit.value && selectedCollection.value) {
      await updateCollection(selectedCollection.value.id, data)
      showSnackbar('Cập nhật thành công!')
    } else {
      await createCollection(data)
      showSnackbar('Tạo mới thành công!')
    }
    formDialog.value = false
    loadCollections({ page: page.value, itemsPerPage: itemsPerPage.value })
  } catch (error: any) {
    showSnackbar(error.message || 'Có lỗi xảy ra', 'error')
  }
}

function confirmDelete(collection: WoodDatabase) {
  collectionToDelete.value = collection
  deleteDialog.value?.open()
}

async function handleDelete() {
  if (!collectionToDelete.value) return

  deleteDialog.value?.setLoading(true)

  try {
    await deleteCollection(collectionToDelete.value.id)
    showSnackbar('Đã xóa collection thành công!')
    loadCollections({ page: page.value, itemsPerPage: itemsPerPage.value })
  } catch (error: any) {
    showSnackbar(error.message || 'Không thể xóa', 'error')
  } finally {
    deleteDialog.value?.close()
    collectionToDelete.value = null
  }
}

function showSnackbar(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}
</script>

<style scoped>
.collection-table :deep(td) {
  vertical-align: middle !important;
}
</style>