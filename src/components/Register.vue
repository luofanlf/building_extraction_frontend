<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Create an account</h1>
      
      <!-- 成功提示框 -->
      <div class="success-message" v-if="successMessage">{{ successMessage }}</div>
      
      <!-- 错误提示框 -->
      <div class="error-message" v-if="error">{{ error }}</div>
      
      <form @submit.prevent="handleRegister">
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
        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input 
            type="password" 
            id="confirm-password" 
            v-model="confirmPassword" 
            required
          />
        </div>
        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>
  
      <!-- 添加登录链接 -->
      <div class="login-link">
        Already have an account? <router-link to="/login">Log in</router-link>
      </div>
    </div>
  </div>
</template>
  
<script>
import api from '../services/api.js';
  
export default {
  name: 'RegisterComponent',
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      loading: false,
      error: null,
      successMessage: null
    }
  },
  methods: {
    async handleRegister() {
      try {
        // 验证密码是否匹配
        if (this.password !== this.confirmPassword) {
          this.error = "Passwords don't match";
          return;
        }
        
        this.loading = true;
        this.error = null;
        this.successMessage = null;
        
        // 调用后端API
        const response = await api.post('/register', {
          username: this.username,
          password: this.password
        });
        
        // 检查响应状态 - 使用code字段
        if (response.code === 0) {
          // 注册成功，显示成功消息
          this.successMessage = 'Account created successfully. Redirecting to login...';
          
          // 延迟跳转，让用户看到成功消息
          setTimeout(() => {
            // 注册成功后跳转到登录页
            this.$router.push('/login');
          }, 1500);
        } else {
          // 如果后端返回的code不是0
          this.error = response.data.err || 'Registration failed';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed. Please try again later.';
        console.error('Registration error:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
  
<style scoped>
.register-container {
  width: 100%;
  min-height: calc(100vh - 70px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9fb;
  padding: 40px 20px;
}

.register-card {
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

input {
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
  margin-top: 8px;
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

.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #555;
}

.login-link a {
  color: #000;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.login-link a:hover {
  color: #333;
  text-decoration: underline;
}
</style>