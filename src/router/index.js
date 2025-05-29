import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminDashboard from '../components/AdminDashboard.vue'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/extract',
      name: 'extract',
      component: () => import('../components/BuildingExtraction.vue')
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../components/History.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../components/Profile.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAdmin: true }
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 检查路由是否需要管理员权限
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    try {
      // 获取用户信息
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      
      // 检查用户是否是管理员
      if (data.code === 0 && data.data && data.data.is_admin) {
        next()
      } else {
        // 如果不是管理员，重定向到首页
        next({ name: 'home' })
      }
    } catch (error) {
      console.error('验证管理员权限失败:', error)
      next({ name: 'home' })
    }
  } else {
    next()
  }
})

export default router 