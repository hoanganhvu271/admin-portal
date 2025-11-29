<template>
  <div>
    <PageHeader
      :title="`Mẫu gỗ - ${collectionId}`"
      subtitle="Quản lý các mẫu gỗ trong bộ sưu tập"
      back-to="/"
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
          Thêm mẫu gỗ
        </v-btn>
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="loading && pieces.length === 0" class="d-flex justify-center py-16">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="pieces.length === 0 && !search"
      icon="mdi-tree-outline"
      title="Chưa có mẫu gỗ nào"
      description="Bắt đầu thêm các mẫu gỗ vào bộ sưu tập này"
    >
      <template #action>
        <v-btn color="primary" @click="openForm()">
          <v-icon start>mdi-plus</v-icon>
          Thêm mẫu gỗ
        </v-btn>
      </template>
    </EmptyState>

    <!-- Data Table -->
    <v-card v-else class="mt-6">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="pieces"
        :items-length="totalItems"
        :loading="loading"
        :search="search"
        @update:options="loadPieces"
        class="piece-table"
      >
        <!-- Images Column -->
        <template #item.image_urls="{ item }">
          <div class="py-3 d-flex ga-2">
            <ImagePreview
              v-for="(url, idx) in (item.image_urls || []).slice(0, 3)"
              :key="idx"
              :src="url"
              :size="48"
            />
            <div
              v-if="!item.image_urls || item.image_urls.length === 0"
              class="empty-image-slot"
            >
              <v-icon size="20" color="secondary">mdi-image-outline</v-icon>
            </div>
          </div>
        </template>

        <!-- Name Column -->
        <template #item.name="{ item }">
          <div>
            <span class="font-weight-medium">{{ item.name }}</span>
            <div class="text-caption text-secondary">ID: {{ item.id }}</div>
          </div>
        </template>

        <!-- Description Column -->
        <template #item.description="{ item }">
          <span
            class="text-body-2 text-secondary text-truncate d-inline-block"
            style="max-width: 350px;"
            v-html="truncateHtml(item.description, 100)"
          />
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
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

    <!-- Piece Form Dialog -->
    <PieceForm
      v-model="formDialog"
      :piece="selectedPiece"
      :database-id="collectionId"
      :is-edit="isEdit"
      @save="handleSave"
    />

    <!-- Delete Confirm Dialog -->
    <ConfirmDialog
      ref="deleteDialog"
      title="Xóa mẫu gỗ"
      :message="`Bạn có chắc chắn muốn xóa '${pieceToDelete?.name}'? Hành động này không thể hoàn tác.`"
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
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PieceForm from './PieceForm.vue'
import {
  getPiecesByDatabase,
  createPiece,
  updatePiece,
  deletePiece,
  type WoodPiece
} from '@/api'

const route = useRoute()
const collectionId = route.params.id as string

const loading = ref(true)
const search = ref('')
const pieces = ref<WoodPiece[]>([])
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)

const formDialog = ref(false)
const selectedPiece = ref<WoodPiece | null>(null)
const isEdit = ref(false)

const pieceToDelete = ref<WoodPiece | null>(null)
const deleteDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const headers = [
  { title: '', key: 'image_urls', sortable: false, width: '180px' },
  { title: 'Tên', key: 'name', sortable: true },
  { title: 'Mô tả', key: 'description', sortable: false },
  { title: '', key: 'actions', sortable: false, width: '100px', align: 'end' as const },
]

function truncateHtml(html: string, maxLength: number): string {
  if (!html) return '—'
  const text = html.replace(/<[^>]*>/g, '')
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadPieces({ page: 1, itemsPerPage: itemsPerPage.value })
  }, 300)
})

async function loadPieces(options: { page: number; itemsPerPage: number; sortBy?: any[] }) {
  loading.value = true
  try {
    const offset = (options.page - 1) * options.itemsPerPage
    const result = await getPiecesByDatabase(collectionId, {
      limit: options.itemsPerPage,
      offset: offset,
      order_by: options.sortBy?.[0]?.key || 'name',
      desc: options.sortBy?.[0]?.order === 'desc'
    })

    pieces.value = result.data || []
    totalItems.value = result.total
  } catch (error) {
    showSnackbar('Không thể tải danh sách mẫu gỗ', 'error')
  } finally {
    loading.value = false
  }
}

function openForm(piece?: WoodPiece) {
  selectedPiece.value = piece || null
  isEdit.value = !!piece
  formDialog.value = true
}

async function handleSave(data: WoodPiece) {
  try {
    if (isEdit.value && selectedPiece.value) {
      await updatePiece(selectedPiece.value.id, data)
      showSnackbar('Cập nhật thành công!')
    } else {
      await createPiece(data)
      showSnackbar('Tạo mới thành công!')
    }
    formDialog.value = false
    loadPieces({ page: page.value, itemsPerPage: itemsPerPage.value })
  } catch (error: any) {
    showSnackbar(error.message || 'Có lỗi xảy ra', 'error')
  }
}

function confirmDelete(piece: WoodPiece) {
  pieceToDelete.value = piece
  deleteDialog.value?.open()
}

async function handleDelete() {
  if (!pieceToDelete.value) return

  deleteDialog.value?.setLoading(true)

  try {
    await deletePiece(pieceToDelete.value.id)
    showSnackbar('Đã xóa mẫu gỗ thành công!')
    loadPieces({ page: page.value, itemsPerPage: itemsPerPage.value })
  } catch (error: any) {
    showSnackbar(error.message || 'Không thể xóa', 'error')
  } finally {
    deleteDialog.value?.close()
    pieceToDelete.value = null
  }
}

function showSnackbar(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}
</script>

<style scoped>
.piece-table :deep(td) {
  vertical-align: middle !important;
}

.empty-image-slot {
  width: 48px;
  height: 48px;
  background: #F5F5F5;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>