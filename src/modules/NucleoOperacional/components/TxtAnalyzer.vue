<template>
  <div class="card shadow-sm border-0">
    <div class="card-header bg-uniodonto-vinho py-3">
      <h5 class="mb-0 fw-bold d-flex align-items-center">
        <i class="bi bi-file-earmark-text me-2"></i>
        Analisador de Guias - Uniodonto
      </h5>
    </div>
    <div class="card-body p-4">
      
      <!-- Área de Upload -->
      <div 
        class="upload-area mb-4 p-5 border-2 border-dashed rounded text-center cursor-pointer"
        :class="{ 'is-active': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="$refs.fileInput.click()"
      >
        <input 
          type="file" 
          ref="fileInput"
          class="d-none" 
          accept=".txt" 
          @change="onFileChange" 
        />
        <div class="upload-icon mb-2">
          <i class="bi bi-cloud-arrow-up fs-1 text-uniodonto-vinho"></i>
        </div>
        <h6 class="fw-bold">Arraste a guia (.txt) ou clique para selecionar</h6>
        <p class="text-muted small mb-0">O processamento é feito 100% no seu navegador.</p>
      </div>

      <!-- Resumo (Summary Cards) -->
      <div v-if="procedimentos.length > 0" class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card bg-light border-0 h-100">
            <div class="card-body">
              <small class="text-muted text-uppercase fw-bold">Total Encontrado</small>
              <h3 class="fw-bold mb-0 text-uniodonto-vinho">{{ estatisticas.total }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-success bg-opacity-10 border-success border-opacity-25 h-100">
            <div class="card-body">
              <small class="text-success text-uppercase fw-bold">Válidos (TISS)</small>
              <h3 class="fw-bold mb-0 text-success">{{ estatisticas.validos }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-danger bg-opacity-10 border-danger border-opacity-25 h-100">
            <div class="card-body">
              <small class="text-danger text-uppercase fw-bold">Inválidos / Não Encontrados</small>
              <h3 class="fw-bold mb-0 text-danger">{{ estatisticas.invalidos }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div v-if="procedimentos.length > 0" class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="mb-0 fw-bold">Resultados da Análise:</h6>
        <div class="btn-group">
          <button class="btn btn-outline-secondary btn-sm" @click="limpar">
            <i class="bi bi-trash me-1"></i> Limpar
          </button>
          <button class="btn btn-uniodonto btn-sm" @click="exportar">
            <i class="bi bi-download me-1"></i> Exportar CSV
          </button>
        </div>
      </div>

      <!-- Tabela de Resultados -->
      <div v-if="procedimentos.length > 0" class="table-responsive">
        <table class="table table-hover align-middle border-top">
          <thead class="table-light">
            <tr>
              <th width="80">Linha</th>
              <th width="150">Código TISS</th>
              <th>Descrição do Procedimento</th>
              <th width="120" class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(proc, index) in procedimentos" :key="index">
              <td class="text-muted small">#{{ proc.linha }}</td>
              <td class="fw-bold font-monospace text-primary">{{ proc.codigo }}</td>
              <td class="small">{{ proc.descricao }}</td>
              <td class="text-center">
                <span 
                  class="badge px-3 py-2 rounded-pill" 
                  :class="proc.valido ? 'bg-success bg-opacity-75' : 'bg-danger bg-opacity-75'"
                >
                  {{ proc.valido ? 'VÁLIDO' : 'INVÁLIDO' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Estado Vazio -->
      <div v-else-if="!estaProcessando" class="text-center py-5 text-muted">
        <i class="bi bi-file-earmark-spreadsheet fs-1 opacity-25 mb-3 d-block"></i>
        <p>Aguardando upload de arquivo para iniciar análise.</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTxtAnalyzer } from '../composables/useTxtAnalyzer';
import { exportToCSV } from '../../../utils/csvExport';

const { 
  procedimentos, 
  estatisticas, 
  estaProcessando, 
  processarArquivo, 
  limpar 
} = useTxtAnalyzer();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    processarArquivo(input.files[0]);
  }
};

const onDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files.length) {
    processarArquivo(event.dataTransfer.files[0]);
  }
};

const exportar = () => {
  exportToCSV('analise_guia_uniodonto.csv', procedimentos.value);
};
</script>

<style scoped lang="scss">
.upload-area {
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  
  &.is-active {
    background-color: #e9ecef;
    border-color: var(--bs-primary) !important;
  }
  
  &:hover {
    background-color: #f1f3f5;
    border-color: #dee2e6;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.font-monospace {
  letter-spacing: 0.5px;
}
</style>
