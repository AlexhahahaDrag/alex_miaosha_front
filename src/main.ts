import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import 'virtual:svg-icons-register'

// import Particles from "particles.vue3";

createApp(App).use(router)
// .use(Particles)
.mount('#app')
