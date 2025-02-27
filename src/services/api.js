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
    // 可以在这里添加认证信息，如token
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

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response && error.response.status === 401) {
      // 处理未授权错误，如重定向到登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 