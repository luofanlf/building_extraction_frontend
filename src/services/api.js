import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 这里使用相对路径，会被代理到后端
  timeout: 300000, // 请求超时时间
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
      console.log('请求头已添加token:', config.headers);
    } else {
      console.log('未找到token');
    }
    return config;
  },
  error => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理常见错误
api.interceptors.response.use(
  response => {
    console.log('API响应:', response);
    return response.data;
  },
  error => {
    console.error('API错误:', error);
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      console.log('检测到401错误，清除认证信息');
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