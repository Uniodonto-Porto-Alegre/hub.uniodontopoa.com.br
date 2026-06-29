<template>
  <div class="container py-5">
    <div class="row mb-4">
      <div class="col">
        <h2 class="fw-bold text-uniodonto-vinho">GESTÃO DE TECNOLOGIA DA INFORMAÇÃO</h2>
        <p class="text-muted mb-0">Selecione uma área para continuar</p>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <div class="display-4 text-uniodonto-vinho mb-3">
              <i class="bi bi-kanban"></i>
            </div>
            <h4 class="card-title fw-bold">DESENVOLVIMENTO DE PROJETOS</h4>
            <p class="card-text text-muted small">Módulo em desenvolvimento.</p>
            <button class="btn btn-secondary module-card-button" disabled>
              Em Breve
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <div class="display-4 text-uniodonto-vinho mb-3">
              <i class="bi bi-diagram-3"></i>
            </div>
            <h4 class="card-title fw-bold">INFRAESTRUTURA DE REDES</h4>
            <p class="card-text text-muted small">Módulo em desenvolvimento.</p>
            <button class="btn btn-secondary module-card-button" disabled>
              Em Breve
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <div class="display-4 text-uniodonto-vinho mb-3">
              <i class="bi bi-key"></i>
            </div>
            <h4 class="card-title fw-bold">PERMISSIONAMENTO</h4>
            <p class="card-text text-muted small">Módulo em desenvolvimento.</p>
            <button class="btn btn-secondary module-card-button" disabled>
              Em Breve
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover-effect:hover {
  transform: translateY(-5px);
  transition: transform 0.2s;
}
</style>
