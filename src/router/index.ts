import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'WoodCollection',
      component: () => import('../views/collections/WoodCollections.vue'),
    },
    {
      path: '/wood_piece',
      name: 'WoodPiece',
      component: () => import('../views/pieces/WoodPieces.vue'),
    },
  ]
})
