import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import About from '../components/About.vue'
import Home from '../components/Home.vue'
import BuildingExtraction from '../components/BuildingExtraction.vue'
import ProjectHistory from '../components/ProjectHistory.vue'


const routes = [
  {
    path: '/',
    name: 'About',
    component: About
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/extract',
    name: 'BuildingExtraction',
    component: BuildingExtraction,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'ProjectHistory',
    component: ProjectHistory,
    meta: { requiresAuth: true } // 需要登录才能访问
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
