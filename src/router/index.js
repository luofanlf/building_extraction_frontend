import { createRouter, createWebHistory } from 'vue-router'
import AdminDashboard from '../components/AdminDashboard.vue'
import api from '../services/api.js'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: () => import('../components/Home.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../components/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../components/Register.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../components/About.vue')
    },
    {
      path: '/extract',
      name: 'extract',
      component: () => import('../components/BuildingExtraction.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../components/ProjectHistory.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../components/MapView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../components/Profile.vue'),
      meta: { requiresAuth: true }
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
  console.log('路由跳转开始:', {
    to: to.path,
    from: from.path,
    requiresAuth: to.matched.some(record => record.meta.requiresAuth),
    requiresAdmin: to.matched.some(record => record.meta.requiresAdmin)
  });

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // 检查是否需要管理员权限
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    console.log('需要管理员权限，开始验证...');
    try {
      const response = await api.get('/user/profile');
      console.log('获取用户信息响应:', response);
      
      if (response.code === 0 && response.data && response.data.is_admin === 1) {
        console.log('验证通过，允许访问管理员页面');
        next();
      } else {
        console.log('验证失败，非管理员用户，重定向到首页');
        next({ name: 'home' });
      }
    } catch (error) {
      console.error('验证管理员权限失败:', error);
      next({ name: 'home' });
    }
  }
  // 检查是否需要登录权限
  else if (to.matched.some(record => record.meta.requiresAuth)) {
    console.log('需要登录权限，检查登录状态...');
    if (isAuthenticated) {
      console.log('用户已登录，允许访问');
      next();
    } else {
      console.log('用户未登录，重定向到登录页面');
      next({ name: 'login' });
    }
  }
  // 不需要特殊权限的路由直接通过
  else {
    console.log('不需要特殊权限，直接通过');
    next();
  }
})

export default router 