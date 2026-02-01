import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Importando Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// Importando nosso CSS customizado (O erro sumirá se este arquivo existir)
import './assets/css/main.scss' 

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')