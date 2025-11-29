<template>
  <v-container fluid class="pa-6">
    <v-card class="mb-6 pa-4" elevation="2">
      <h1 class="text-h4 d-flex align-center">
        <v-icon class="mr-3" color="primary" size="large">mdi-folder-open</v-icon>
        Quản lý bộ sưu tập gỗ
      </h1>
      <v-divider class="my-3" />
      <div class="d-flex justify-space-between align-center">
        <v-btn color="primary" variant="flat" size="large" @click="openForm()">
          <v-icon left>mdi-plus-circle</v-icon>
          Thêm Collection
        </v-btn>
        <v-text-field
          v-model="search"
          label="Tìm kiếm Collection"
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
      :items="collections"
      :search="search"
      item-key="id"
      class="elevation-3"
    >
      <template #item.title="{ item }">
        <v-chip
          color="primary"
          variant="tonal"
          class="cursor-pointer"
          @click="goToPieces(item)"
        >
          {{ item.title }}
        </v-chip>
      </template>

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
            <v-btn icon size="small" color="red" variant="tonal" v-bind="props" @click="deleteCollection(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <v-icon size="large" color="grey-lighten-1">mdi-database-off</v-icon>
          <p class="text-medium-emphasis mt-2">Không tìm thấy Collection nào.</p>
        </div>
      </template>
    </v-data-table>

    <CollectionForm
      v-model="dialog"
      :collection="selectedCollection"
      @save="saveCollection"
    />
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import CollectionForm from './CollectionForm.vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  components: { CollectionForm },

  setup() {
    const router = useRouter()
    const search = ref('') // Thêm biến search

    const dialog = ref(false)
    const selectedCollection = ref<any>(null)

    const collections = ref([
      {
        id: 'vn_26',
        title: 'VN_26',
        size: 26,
        description: '26 loài gỗ Châu Phi…',
      },
      // Thêm dữ liệu mẫu khác để test search
      {
        id: 'asia_50',
        title: 'ASIA_50',
        size: 50,
        description: '50 loại gỗ quý Châu Á…',
      }
    ])

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Tên', key: 'title' },
      { title: 'Size', key: 'size' },
      { title: 'Mô tả', key: 'description' }, // Thêm cột mô tả
      { title: 'Actions', key: 'actions', sortable: false },
    ]

    // ... (Các hàm openForm, goToPieces, saveCollection, deleteCollection giữ nguyên) ...
    const openForm = (item?: any) => {
      selectedCollection.value = item ?? null
      dialog.value = true
    }

    const goToPieces = (item: any) => {
      router.push(`/wood_piece?collection_id=${item.id}`)
    }

    const saveCollection = (collection: any) => {
      if (collection.id) {
        const idx = collections.value.findIndex(c => c.id === collection.id)
        if (idx !== -1) collections.value[idx] = collection
      } else {
        collection.id = 'col_' + Date.now()
        collections.value.push(collection)
      }
    }

    const deleteCollection = (item: any) => {
      const idx = collections.value.findIndex(c => c.id === item.id)
      if (idx !== -1) collections.value.splice(idx, 1)
    }

    return {
      dialog,
      selectedCollection,
      collections,
      headers,
      openForm,
      goToPieces,
      saveCollection,
      deleteCollection,
      search, // Return search
    }
  },
})
</script>