import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './assets/css/global.less'
import store from './store/index.js'

import SocketService from './utils/socket_service.js'
SocketService.Instance.connect()



// 将SocketService对象挂载到vue的原型对象上 方便组件调用该对象中的方法
Vue.prototype.$socket = SocketService.Instance

// 请求基准路径的配置
axios.defaults.baseURL = 'http://127.0.0.1:3000/api/'
// 将axios挂载到Vue原型对象上
Vue.prototype.$http = axios;

// 将全局的echarts对象挂载到Vue的原型对象上
Vue.prototype.$echarts = window.echarts;

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')