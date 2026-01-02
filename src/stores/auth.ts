import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { auth } from '@/config/firebase'

const currentUser = ref<User | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Lắng nghe thay đổi trạng thái auth
onAuthStateChanged(auth, (user) => {
  currentUser.value = user
  loading.value = false
})

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value)
  const user = computed(() => currentUser.value)
  const isLoading = computed(() => loading.value)
  const authError = computed(() => error.value)

  async function signIn(email: string, password: string): Promise<boolean> {
    error.value = null
    loading.value = true
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (err: any) {
      console.error('Sign in error:', err)
      
      // Map Firebase error codes to Vietnamese messages
      switch (err.code) {
        case 'auth/user-not-found':
          error.value = 'Tài khoản không tồn tại'
          break
        case 'auth/wrong-password':
          error.value = 'Mật khẩu không đúng'
          break
        case 'auth/invalid-email':
          error.value = 'Email không hợp lệ'
          break
        case 'auth/too-many-requests':
          error.value = 'Quá nhiều lần thử. Vui lòng thử lại sau'
          break
        case 'auth/invalid-credential':
          error.value = 'Email hoặc mật khẩu không đúng'
          break
        default:
          error.value = 'Đăng nhập thất bại. Vui lòng thử lại'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  function clearError() {
    error.value = null
  }

  // Lấy token để gửi lên backend
  async function getIdToken(): Promise<string | null> {
    if (!currentUser.value) return null
    try {
      return await currentUser.value.getIdToken()
    } catch (err) {
      console.error('Get token error:', err)
      return null
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    authError,
    signIn,
    signOut,
    clearError,
    getIdToken
  }
}