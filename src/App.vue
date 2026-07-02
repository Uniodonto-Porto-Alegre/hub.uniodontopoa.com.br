<template>
  <Navbar />
  <router-view />
  <footer v-if="$route.name !== 'login'" style="text-align:center;padding:16px 0 0;margin-top:20px;border-top:1px solid #eee;">
    <img src="/images/Selo_ANS_Curvas-1-1.png" alt="Selo ANS" style="height:22px;">
    <p style="font-size:10px;color:#aaa;margin-top:6px;">© {{ new Date().getFullYear() }} UNIODONTO PORTO ALEGRE COOPERATIVA ODONTOLOGICA LTDA, CNPJ: 88.938.089/0001-82. Todos os direitos reservados.</p>
  </footer>
</template>

<script setup lang="ts">
  import Navbar from './components/Layoult/Navbar.vue';
</script>
