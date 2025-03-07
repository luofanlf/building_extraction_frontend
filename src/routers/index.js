import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import About from '../components/About.vue'
import Home from '../components/Home.vue'
import BuildingExtraction from '../components/BuildingExtraction.vue'
import ProjectHistory from '../components/ProjectHistory.vue'
import Register from '../components/Register.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
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
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: () => import('../components/ProjectDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要登录权限
  if (to.meta.requiresAuth) {
    // 检查用户是否已登录
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    
    if (!isAuthenticated) {
      // 未登录，重定向到登录页面
      next({ path: '/login' })
    } else {
      // 已登录，允许访问
      next()
    }
  } else {
    // 不需要登录权限的路由，直接访问
    next()
  }
})

export default router
