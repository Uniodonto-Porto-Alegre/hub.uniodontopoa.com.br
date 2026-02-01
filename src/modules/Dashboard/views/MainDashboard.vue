<template>
  <div class="container py-5">
    <div class="row mb-5 align-items-center">
      <div class="col-auto">
        <img src="../../../assets/logo.png" alt="Uniodonto" height="60">
      </div>
      <div class="col border-start ps-4">
        <h1 class="fw-bold text-dark mb-0">Portal de Auditoria</h1>
        <p class="text-muted mb-0">Selecione um módulo para começar</p>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4">
            <div class="display-4 text-uniodonto-vinho mb-3">
              <i class="bi bi-file-earmark-medical"></i>
            </div>
            <h4 class="card-title fw-bold">Núcleo Operacional</h4>
            <p class="card-text text-muted small">
              Auditoria de Guias, Análise de TXT e validação de procedimentos TISS.
            </p>
            <router-link to="/operacional" class="btn btn-uniodonto w-100 mt-3 shadow-sm">
              Acessar Módulo
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 opacity-50">
          <div class="card-body text-center p-4">
            <div class="display-4 text-secondary mb-3">💰</div>
            <h4 class="card-title fw-bold text-muted">Financeiro</h4>
            <p class="card-text text-muted small">
              Módulo em desenvolvimento.
            </p>
            <button class="btn btn-secondary w-100 mt-3" disabled>
              Em Breve
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Nenhuma lógica necessária por enquanto, apenas links
</script>

<style scoped>
.hover-effect:hover {
  transform: translateY(-5px);
  transition: transform 0.2s;
}
</style>