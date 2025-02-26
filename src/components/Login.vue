<template>
  <div class="login-container">
    <h2>Sign in to your account</h2>
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
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginComponent',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      console.log('登录信息:', this.username, this.password)
      
      // 这里应添加实际的登录验证逻辑
      // 例如调用API进行用户验证
      
      // 设置登录状态
      localStorage.setItem('isAuthenticated', 'true')
      
      // 通知其他组件登录状态变化(可选)
      window.dispatchEvent(new Event('storage'))
      
      // 登录成功后跳转到首页
      this.$router.push('/home')
    }
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
</style>