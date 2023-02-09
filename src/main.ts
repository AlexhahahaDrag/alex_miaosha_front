import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import 'virtual:svg-icons-register'
//引入store
import { setupStore } from "@/store";
import Particles from "particles.vue3";
import 'ant-design-vue/es/message/style/css'; 

import directive from '@/views/common/js/index'; // 统一自定义指令入口

const app = createApp(App);
// Configure store
setupStore(app);
app.use(router).use(Particles).mount("#app");
directive(app)