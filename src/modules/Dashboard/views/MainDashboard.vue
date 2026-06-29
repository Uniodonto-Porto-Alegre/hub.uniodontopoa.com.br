<template>
  <div class="container py-5">
    <div class="row mb-5 align-items-center">
      <div class="col-auto">
        <img src="../../../assets/logo.png" alt="Uniodonto" height="60">
      </div>
      <div class="col border-start ps-4">
        <h1 class="fw-bold text-dark mb-0">HUB de Sistemas Uniodonto Porto Alegre</h1>
        <p class="text-muted mb-0">Selecione um módulo para começar</p>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <div class="display-4 text-uniodonto-vinho mb-3">
              <i class="bi bi-file-earmark-medical"></i>
            </div>
            <h4 class="card-title fw-bold">GESTÃO ADM FINANCEIRO E PROVIMENTOS EM SAÚDE</h4>
            <p class="card-text text-muted small">
              Auditoria de Guias, Análise de TXT e validação de procedimentos TISS.
            </p>
              <router-link to="/gestao-adm-financeiro-provimentos" class="btn btn-uniodonto module-card-button shadow-sm">
              Acessar Módulo
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">            
            <h4 class="card-title fw-bold text-muted">DHO E GESTÃO</h4>
            <p class="card-text text-muted small">
              Departamento Pessoal, Qualidade e Recursos Humanos.
            </p>
              <router-link to="/dho-gestao" class="btn btn-uniodonto module-card-button shadow-sm">
              Acessar Módulo
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <h4 class="card-title fw-bold text-muted">GESTAÕ DE MARKETING</h4>
            <p class="card-text text-muted small">
              Módulo em desenvolvimento.
            </p>
              <button class="btn btn-secondary module-card-button" disabled>
              Em Breve
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <h4 class="card-title fw-bold text-muted">GESTÃO COMERCIAL</h4>
            <p class="card-text text-muted small">
              Módulo em desenvolvimento.
            </p>
              <button class="btn btn-secondary module-card-button" disabled>
              Em Breve
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <h4 class="card-title fw-bold text-muted">RELAÇÕES INSTITUCIONAIS</h4>
            <p class="card-text text-muted small">
              Módulo em desenvolvimento.
            </p>
              <button class="btn btn-secondary module-card-button" disabled>
              Em Breve
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <h4 class="card-title fw-bold text-muted">GESTÃO DE RELACIONAMENTO</h4>
            <p class="card-text text-muted small">
              Módulo em desenvolvimento.
            </p>
              <button class="btn btn-secondary module-card-button" disabled>
              Em Breve
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <h4 class="card-title fw-bold text-muted">GESTAO DE TECNOLOGIA DA INFORMAÇÃO</h4>
            <p class="card-text text-muted small">
              Desenvolvimento de Projetos, Infraestrutura de Redes e Permissionamento.
            </p>
              <router-link to="/tecnologia-informacao" class="btn btn-uniodonto module-card-button shadow-sm">
              Acessar Módulo
            </router-link>
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