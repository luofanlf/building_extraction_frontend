<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Sign in to your account</h1>
      
      <!-- 成功提示框 -->
      <div class="success-message" v-if="successMessage">{{ successMessage }}</div>
      
      <!-- 错误提示框 -->
      <div class="error-message" v-if="error">{{ error }}</div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username or Email</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
          />
        </div>
        <div class="remember-forgot">
          <div class="remember-me">
            <input type="checkbox" id="remember" v-model="rememberMe">
            <label for="remember">Remember me</label>
          </div>
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>
        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
  
      <!-- 添加注册链接 -->
      <div class="signup-link">
        Don't have an account? <router-link to="/register">Sign up</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js';

export default {
  name: 'LoginComponent',
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false,
      loading: false,
      error: null,
      successMessage: null,
      redirectPath: null
    }
  },
  created() {
    // 获取查询参数中的重定向路径
    if (this.$route.query.redirect) {
      this.redirectPath = this.$route.query.redirect
    }
  },
  methods: {
    async handleLogin() {
      try {
        this.loading = true;
        this.error = null;
        this.successMessage = null;
        
        console.log('Login attempt with:', { username: this.username, password: '***' });
        
        // 调用后端API
        const response = await api.post('/login', {
          username: this.username,
          password: this.password
        });
        
        console.log('Login raw response:', response);
        
        // 获取响应数据
        const apiResponse = response.data;
        console.log('API Response:', apiResponse);
        
        // 检查是否包含token（成功标志）
        if (apiResponse && apiResponse.token) {
          // 保存token到localStorage
          localStorage.setItem('token', apiResponse.token);
          console.log('Token saved successfully');
          
          // 设置认证状态
          localStorage.setItem('isAuthenticated', 'true');
          
          // 显示成功消息
          this.successMessage = apiResponse.message || 'Login successful. Redirecting...';
          
          // 通知其他组件登录状态变化
          window.dispatchEvent(new Event('storage'));
          
          // 延迟跳转，让用户看到成功消息
          setTimeout(() => {
            if (this.redirectPath) {
              this.$router.push(this.redirectPath);
            } else {
              this.$router.push('/home');
            }
          }, 1000);
        } else {
          // 如果没有token但有message，可能是业务逻辑错误
          if (apiResponse && apiResponse.message) {
            this.error = apiResponse.message;
          } else {
            this.error = 'Login failed: Invalid credentials';
          }
        }
      } catch (err) {
        console.error('Login error details:', err);
        
        // 提供更详细的错误信息
        if (err.response) {
          console.log('Error response:', err.response);
          this.error = (err.response.data && err.response.data.message) 
            ? err.response.data.message 
            : `Login failed: Server returned ${err.response.status}`;
        } else if (err.request) {
          this.error = 'Login failed: No response received from server';
        } else {
          this.error = 'Error during login: ' + err.message;
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  min-height: calc(100vh - 70px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9fb;
  padding: 40px 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
}

h1 {
  color: #000;
  margin-bottom: 24px;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #555;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #fff;
}

input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 8px;
}

.forgot-password {
  color: #000;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #333;
  text-decoration: underline;
}

.btn {
  width: 100%;
  padding: 12px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background-color: #333;
  transform: translateY(-1px);
}

.btn:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.success-message {
  background-color: #f1f8f1;
  color: #2d652d;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #c3e6c3;
  font-size: 14px;
}

.error-message {
  background-color: #fdf3f3;
  color: #c22f2f;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f2c3c3;
  font-size: 14px;
}

.signup-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #555;
}

.signup-link a {
  color: #000;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.signup-link a:hover {
  color: #333;
  text-decoration: underline;
}
</style>