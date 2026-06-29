<template>
  <div class="container py-5">
    <div class="row mb-4">
      <div class="col">
        <h2 class="fw-bold text-uniodonto-vinho">GESTÃO ADM FINANCEIRO E PROVIMENTOS EM SAÚDE</h2>
        <p class="text-muted mb-0">Selecione uma área para continuar</p>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-6">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <div class="display-4 text-uniodonto-vinho mb-3">
              <i class="bi bi-cash-stack"></i>
            </div>
            <h4 class="card-title fw-bold">FINANCEIRO</h4>
            <p class="card-text text-muted small">Importe faturas, execute a consulta e gere o XLSX com links XML.</p>
            <button class="btn btn-uniodonto module-card-button shadow-sm" @click="mostrarFerramentaFinanceiro = !mostrarFerramentaFinanceiro">
              {{ mostrarFerramentaFinanceiro ? 'Ocultar Ferramenta' : 'Acessar Financeiro' }}
            </button>
          </div>
        </div>

        <div v-if="mostrarFerramentaFinanceiro" class="mt-3">
          <FinanceiroXmlExport />
        </div>
      </div>

      <div class="col-md-6">
        <div class="card h-100 shadow-sm border-0 hover-effect">
          <div class="card-body text-center p-4 module-card-body">
            <div class="display-4 text-uniodonto-vinho mb-3">
              <i class="bi bi-file-earmark-medical"></i>
            </div>
            <h4 class="card-title fw-bold">PROVIMENTOS</h4>
            <p class="card-text text-muted small">
              Acesse a tela operacional de auditoria e análise de guias.
            </p>
            <router-link to="/provimentos/operacional" class="btn btn-uniodonto module-card-button shadow-sm">
              Acessar Provimentos
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FinanceiroXmlExport from '../components/FinanceiroXmlExport.vue';

const mostrarFerramentaFinanceiro = ref(false);
</script>

<style scoped>
.hover-effect:hover {
  transform: translateY(-5px);
  transition: transform 0.2s;
}
</style>
