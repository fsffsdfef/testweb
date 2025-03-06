import { createApp } from 'vue'
import store from "@/stores/index"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as Icons from '@element-plus/icons-vue'
import App from "@/App.vue";
import router from './router'

const app = createApp(App)
app.use(ElementPlus)
app.use(store)
app.use(router)
app.mount('#app')
Object.keys(Icons).forEach((key)=>{
    app.component(key,Icons[key as keyof typeof Icons])
})