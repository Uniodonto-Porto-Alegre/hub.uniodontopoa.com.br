import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../modules/Auth/views/LoginView.vue'
import MainDashboard from '../modules/Dashboard/views/MainDashboard.vue'
import HomeDhoGestao from '../modules/Dashboard/views/HomeDhoGestao.vue'
import HomeTecnologiaInformacao from '../modules/Dashboard/views/HomeTecnologiaInformacao.vue'
import HomeFinanceiroProvimentos from '../modules/NucleoOperacional/views/HomeFinanceiroProvimentos.vue'
import HomeOperacional from '../modules/NucleoOperacional/views/HomeOperacional.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'dashboard',
      component: MainDashboard,
      meta: { requiresAuth: true } // Futura validação AD
    },
    {
      path: '/gestao-adm-financeiro-provimentos',
      name: 'gestao-adm-financeiro-provimentos',
      component: HomeFinanceiroProvimentos,
      meta: { requiresAuth: true }
    },
    {
      path: '/dho-gestao',
      name: 'dho-gestao',
      component: HomeDhoGestao,
      meta: { requiresAuth: true }
    },
    {
      path: '/tecnologia-informacao',
      name: 'tecnologia-informacao',
      component: HomeTecnologiaInformacao,
      meta: { requiresAuth: true }
    },
    {
      path: '/provimentos/operacional',
      name: 'provimentos-operacional',
      component: HomeOperacional,
      meta: { requiresAuth: true }
    },
    {
      path: '/operacional',
      name: 'operacional',
      redirect: '/provimentos/operacional'
    }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  authStore.hydrateFromSession()

  if (!authStore.token) {
    if (to.meta.requiresAuth) {
      return '/login'
    }

    return true
  }

  let isSessionValid = false

  try {
    isSessionValid = await authStore.validateSession()
  } catch {
    isSessionValid = false
  }

  if (!isSessionValid) {
    if (to.meta.requiresAuth) {
      return '/login'
    }

    return true
  }

  if (to.name === 'login') {
    return '/'
  }

  return true
})

export default router