import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Collections',
      component: () => import('../views/collections/CollectionList.vue'),
    },
    {
      path: '/collection/:id/pieces',
      name: 'Pieces',
      component: () => import('../views/pieces/PieceList.vue'),
      props: true
    },
  ]
})