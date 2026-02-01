<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3" v-if="$route.name !== 'login'">
    <div class="container">
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <img src="../../assets/logo.png" alt="Uniodonto" height="40" class="me-2">
      </router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center">
          <li class="nav-item me-3">
            <router-link class="nav-link fw-bold" :class="{ 'active text-uniodonto-vinho': $route.name === 'dashboard' }" to="/">
              Dashboard
            </router-link>
          </li>
          <li class="nav-item me-3">
            <router-link class="nav-link fw-bold" :class="{ 'active text-uniodonto-vinho': $route.name === 'operacional' }" to="/operacional">
              Núcleo Operacional
            </router-link>
          </li>
          <li class="nav-item dropdown ms-lg-3">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div class="avatar-circle me-2 bg-uniodonto-vinho">
                {{ userInitials }}
              </div>
              <span class="d-none d-md-inline fw-bold text-dark">{{ userName }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end border-0 shadow-sm mt-2">
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item text-danger" @click="logout">
                  <i class="bi bi-box-arrow-right me-2"></i>Sair
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userName = 'Auditor Uniodonto'; // Placeholder

const userInitials = computed(() => {
  return userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
});

const logout = () => {
  sessionStorage.removeItem('user_token');
  router.push('/login');
};
</script>

<style scoped lang="scss">
.nav-link {
  color: #6c757d;
  transition: all 0.3s ease;
  
  &:hover {
    color: #a60069 !important;
  }
  
  &.router-link-active {
    color: #a60069 !important;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #a60069;
    }
  }
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.dropdown-item:active {
  background-color: #a60069;
}
</style>
