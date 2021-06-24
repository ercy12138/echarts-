import Vue from 'vue'
import VueRouter from 'vue-router'
import ScreenPage from '../views/ScreenPage.vue'

Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/screen' },
    { path: '/screen', name: 'screen', component: ScreenPage }

]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router