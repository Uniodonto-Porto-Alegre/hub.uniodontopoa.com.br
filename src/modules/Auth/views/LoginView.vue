<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100 bg-uniodonto-vinho bg-opacity-10">
    <div class="card shadow border-0" style="max-width: 400px; width: 100%;">
      <div class="card-body p-5">
        <div class="text-center mb-5">
          <img src="../../../assets/logo.png" alt="Uniodonto" height="60" class="mb-4">
          <h4 class="fw-bold text-dark">Portal de Auditoria</h4>
          <p class="text-muted small">Use suas credenciais do AD</p>
        </div>

        <form @submit.prevent="fazerLogin">
          <div class="mb-3">
            <label class="form-label fw-bold small">Usuário</label>
            <input v-model="usuario" type="text" class="form-control bg-light border-0" placeholder="usuario.ad" required />
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold small">Senha</label>
            <input v-model="senha" type="password" class="form-control bg-light border-0" placeholder="••••••" required />
          </div>

          <button type="submit" class="btn btn-uniodonto w-100 py-3 fw-bold shadow-sm">
            ENTRAR
          </button>
        </form>

        <div class="mt-3 text-center">
          <small class="text-muted">Ambiente de Desenvolvimento</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const usuario = ref('');
const senha = ref('');

const fazerLogin = () => {
  // SIMULAÇÃO DE LOGIN
  // Em produção, isso chamará o Backend Python/LDAP
  if (usuario.value) {
    sessionStorage.setItem('user_token', 'demo-token-123');
    router.push('/'); // Manda para o Dashboard
  }
};
</script>