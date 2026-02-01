import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../modules/Auth/views/LoginView.vue'
import MainDashboard from '../modules/Dashboard/views/MainDashboard.vue'
import HomeOperacional from '../modules/NucleoOperacional/views/HomeOperacional.vue'

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
      path: '/operacional',
      name: 'operacional',
      component: HomeOperacional,
      meta: { requiresAuth: true }
    }
  ]
})

// Guard para simular checagem de login
router.beforeEach((to, from, next) => {
  const isAuthenticated = sessionStorage.getItem('user_token'); // Simulação
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router