import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createPinia } from 'pinia';
import { BootstrapIconsPlugin } from 'bootstrap-icons-vue';

const pinia = createPinia();

const app = createApp(App);

app.use(pinia);
app.use(BootstrapIconsPlugin);
app.mount('#app');
