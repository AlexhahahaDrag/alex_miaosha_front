import App from './App.vue';
import router from './router';
import 'virtual:svg-icons-register';
//引入store
import { setupStore } from '@/store';
import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';
import '@/style/index.scss';

const app = createApp(App);
// Configure store
setupStore(app);
app
  .use(router)
  .use(Particles, {
    init: async (engine) => {
      // await loadFull(engine); // you can load the full tsParticles library from "tsparticles" if you need it
      await loadSlim(engine); // or you can load the slim version from "@tsparticles/slim" if don't need Shapes or Animations
    },
  })
  .mount('#app');
