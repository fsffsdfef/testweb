import { createApp } from 'vue'
import store from "@/stores/index"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as Icons from '@element-plus/icons-vue'
import App from "@/App.vue";
import router from './router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)
app.use(ElementPlus, { locale: zhCn })
app.use(store)
app.use(router)
app.mount('#app')
Object.keys(Icons).forEach((key)=>{
    app.component(key,Icons[key as keyof typeof Icons])
})