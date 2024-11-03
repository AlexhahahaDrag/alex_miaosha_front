import App from './App.vue'
import router from "./router";
import 'virtual:svg-icons-register'
//引入store
import { setupStore } from "@/store";
import Particles from "particles.vue3";
import '@/style/index.scss';

const app = createApp(App);
// Configure store
setupStore(app);
app.use(router).use(Particles).mount("#app");
