import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/routes.js'
// import { VuesticPlugin } from 'vuestic-ui'
import {createPinia} from "pinia"
import { transferServer } from '@/stores/transferServer'
// import defCss from './assets/css/default.css'

window.Kakao.init('69bc3de5353555bad03937a335738e33');

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
// app.use(defCss)
// app.use(VuesticPlugin)

app.config.globalProperties.$callService = transferServer()
//const store = transferServer()
app.mount('#app')
