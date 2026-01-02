import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { watch } from 'vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Collections',
      component: () => import('../views/collections/CollectionList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/collection/:id/pieces',
      name: 'Pieces',
      component: () => import('../views/pieces/PieceList.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
  ]
})

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const { isAuthenticated, isLoading } = useAuth()

  // Đợi auth state được load xong
  if (isLoading.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isLoading, (loading) => {
        if (!loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !isAuthenticated.value) {
    // Chưa đăng nhập, redirect về login
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && isAuthenticated.value) {
    // Đã đăng nhập rồi mà vào login, redirect về home
    next({ name: 'Collections' })
  } else {
    next()
  }
})

export default router