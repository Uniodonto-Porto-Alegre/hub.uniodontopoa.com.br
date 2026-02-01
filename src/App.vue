<template>
  <Navbar />
  <router-view />
</template>

<script setup lang="ts">
  import Navbar from './components/Layoult/Navbar.vue';
  import { onMounted } from 'vue';
  
  // Importar o JS do Bootstrap para dropdowns e togglers funcionarem
  onMounted(async () => {
    await import('bootstrap/dist/js/bootstrap.bundle.min.js');
  });
</script>
