import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import 'virtual:svg-icons-register'
//引入store
import { setupStore } from "@/store";
import Particles from "particles.vue3";
import 'ant-design-vue/es/message/style/css'; 

const app = createApp(App);
// Configure store
setupStore(app);
app.use(router).use(Particles).mount("#app");