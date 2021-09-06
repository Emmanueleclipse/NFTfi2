import { createApp } from 'vue'
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import App from './App.vue'
import router from "./router"
import mitt from 'mitt';
import store from './store'


const emitter = mitt();
const app = createApp(App).use(router).use(store)
app.config.globalProperties.emitter = emitter;
app.component("pagination", VPagination)
app.mount('#app');