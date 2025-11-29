<template>
  <v-container fluid class="pa-6">
    <v-card class="mb-6 pa-4" elevation="2">
      <h1 class="text-h4 d-flex align-center">
        <v-icon class="mr-3" color="info" size="large">mdi-tree</v-icon>
        Danh sách mẫu gỗ (Wood Pieces)
      </h1>
      <v-divider class="my-3" />
      <h3 class="text-subtitle-1 font-weight-bold mb-3">
        <v-icon left>mdi-folder-information</v-icon>
        Collection ID: <span class="text-primary">{{ collectionId || 'Chưa chọn' }}</span>
      </h3>

      <div class="d-flex justify-space-between align-center">
        <v-btn
          color="success"
          variant="flat"
          size="large"
          :disabled="!collectionId"
          @click="openForm()"
        >
          <v-icon left>mdi-plus-circle</v-icon>
          Thêm Wood Piece
        </v-btn>
        <v-text-field
          v-model="search"
          label="Tìm kiếm Wood Piece"
          density="compact"
          variant="solo"
          flat
          clearable
          prepend-inner-icon="mdi-magnify"
          style="max-width: 300px;"
          class="ml-4"
        />
      </div>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="filteredItems"
      :search="search"
      item-key="id"
      class="elevation-3"
    >
      <template #item.actions="{ item }">
        <v-tooltip text="Sửa">
          <template v-slot:activator="{ props }">
            <v-btn icon size="small" color="blue" variant="tonal" v-bind="props" class="mr-2" @click="openForm(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Xóa">
          <template v-slot:activator="{ props }">
            <v-btn icon size="small" color="red" variant="tonal" v-bind="props" @click="deleteItem(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <v-icon size="large" color="grey-lighten-1">mdi-database-off</v-icon>
          <p class="text-medium-emphasis mt-2">Không có mẫu gỗ nào trong Collection **{{ collectionId }}**.</p>
        </div>
      </template>
    </v-data-table>

    <PieceForm
      v-model="dialog"
      :database-id="collectionId"
      :item="selected"
      @save="saveItem"
    />
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import PieceForm from './PieceForm.vue' // Đổi tên thành PieceForm
import { useRoute } from 'vue-router'

export default defineComponent({
  components: { PieceForm },

  setup() {
    const route = useRoute()
    const collectionId = route.query.collection_id as string
    const search = ref('') // Thêm biến search

    const dialog = ref(false)
    const selected = ref<any>(null)

    const items = ref([
      {
        id: 'vn_26_01',
        collection_id: 'vn_26',
        name: 'Allantoma Decandra (Mẫu 1)',
        description: 'Mô tả HTML…',
        images: ['https://via.placeholder.com/100'], // Thêm ảnh mẫu
      },
      {
        id: 'vn_26_02',
        collection_id: 'vn_26',
        name: 'Dipteryx Odorata (Mẫu 2)',
        description: 'Mô tả chi tiết…',
        images: [],
      },
      // Thêm mẫu cho collection khác để test filter
      {
        id: 'asia_50_01',
        collection_id: 'asia_50',
        name: 'Gỗ Sưa',
        description: 'Loài gỗ quý hiếm',
        images: [],
      }
    ])

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Name', key: 'name' },
      { title: 'Description', key: 'description' },
      { title: 'Actions', key: 'actions', sortable: false },
    ]

    // Lọc theo collectionId và dùng cho search
    const filteredItems = computed(() =>
      items.value.filter(i => i.collection_id === collectionId)
    )

    // ... (Các hàm openForm, saveItem, deleteItem giữ nguyên) ...
    const openForm = (item?: any) => {
      selected.value = item ?? null
      dialog.value = true
    }

    const saveItem = (item: any) => {
      if (item.id) {
        const idx = items.value.findIndex(i => i.id === item.id)
        if (idx !== -1) items.value[idx] = item
      } else {
        item.id = 'piece_' + Date.now()
        item.collection_id = collectionId
        items.value.push(item)
      }
    }

    const deleteItem = (item: any) => {
      const idx = items.value.findIndex(i => i.id === item.id)
      if (idx !== -1) items.value.splice(idx, 1)
    }

    return {
      dialog,
      selected,
      items,
      headers,
      collectionId,
      filteredItems,
      openForm,
      deleteItem,
      saveItem,
      search, // Return search
    }
  },
})
</script>