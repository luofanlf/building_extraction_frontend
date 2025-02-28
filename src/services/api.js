import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 这里使用相对路径，会被代理到后端
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理常见错误
api.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data;
  },
  error => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除token和认证状态
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      
      // 如果不在登录页面，则跳转到登录页面
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// 登出功能
api.logout = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
  window.dispatchEvent(new Event('storage'));
  window.location.href = '/login';
};

export default api; 