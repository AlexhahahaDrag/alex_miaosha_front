import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
//引入store
import { setupStore } from '@/store';
import '@/style/index.less';
import { setupPermissionDirective } from '@/directives/permission';

const app = createApp(App);
// Configure store
setupStore(app);
setupPermissionDirective(app);

app.use(router).mount('#app');
