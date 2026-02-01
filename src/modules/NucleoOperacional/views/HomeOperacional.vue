<template>
  <div class="container py-5">
    <div class="row mb-4">
      <div class="col">
        <h2 class="fw-bold text-uniodonto-vinho">Núcleo Operacional</h2>
        <p class="text-muted">Módulo de Auditoria e Conferência de Guias</p>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <TxtAnalyzer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Importando o componente que criamos antes
// Certifique-se que o TxtAnalyzer.vue está na pasta ../components/
import TxtAnalyzer from '../components/TxtAnalyzer.vue';
</script>