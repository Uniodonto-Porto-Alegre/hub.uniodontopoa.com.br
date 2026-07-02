<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100 bg-uniodonto-vinho bg-opacity-10">
    <div class="card shadow border-0" style="max-width: 400px; width: 100%;">
      <div class="card-body p-5">
        <div class="text-center mb-5">
          <img src="../../../assets/logo.png" alt="Uniodonto" height="95" class="mb-4">
          <h4 class="fw-bold text-dark">HUB de Sistemas Uniodonto Porto Alegre</h4>
          <p class="text-muted small">Use suas credenciais de rede</p>
        </div>

        <form @submit.prevent="fazerLogin">
          <div class="mb-3">
            <label class="form-label fw-bold small">Usuário</label>
            <input v-model="usuario" type="text" class="form-control bg-light border-0" placeholder="Usuário de Rede" :disabled="isLoading" required />
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold small">Senha</label>
            <input v-model="senha" type="password" class="form-control bg-light border-0" placeholder="••••••" :disabled="isLoading" required />
          </div>

          <div v-if="errorMessage" class="alert alert-danger py-2 small" role="alert">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-uniodonto w-100 py-3 fw-bold shadow-sm" :disabled="isLoading">
            {{ isLoading ? 'ENTRANDO...' : 'ENTRAR' }}
          </button>
        </form>

        <!--<div class="mt-3 text-center">
          <small class="text-muted">Ambiente de Desenvolvimento</small>
        </div>-->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth';
import { loginWithAd } from '../../../services/auth';

const router = useRouter();
const authStore = useAuthStore();
const usuario = ref('');
const senha = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const fazerLogin = async () => {
  if (!usuario.value.trim() || !senha.value.trim()) {
    errorMessage.value = 'Informe usuário e senha para autenticar.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const result = await loginWithAd({
      username: usuario.value,
      password: senha.value,
    });

    authStore.login({
      token: result.token,
      username: result.user.username,
      displayName: result.user.displayName,
      email: result.user.email,
    });

    router.push('/');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha inesperada ao autenticar com o Active Directory.';
  } finally {
    isLoading.value = false;
  }
};
</script>