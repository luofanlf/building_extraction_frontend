<template>
  <div id="app">
    <nav>
      <router-link to="/">关于</router-link> |
      <router-link to="/home" v-if="isLoggedIn">个人主页</router-link> |
      <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
      <a href="#" @click.prevent="logout" v-if="isLoggedIn">退出登录</a>
    </nav>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false
    }
  },
  created() {
    // 在组件创建时检查登录状态
    this.checkLoginStatus()
    
    // 监听登录状态变化
    window.addEventListener('storage', this.checkLoginStatus)
  },
  beforeUnmount() {
    // 移除事件监听器
    window.removeEventListener('storage', this.checkLoginStatus)
  },
  methods: {
    checkLoginStatus() {
      // 从localStorage获取登录状态
      this.isLoggedIn = localStorage.getItem('isAuthenticated') === 'true'
    },
    logout() {
      // 清除登录状态
      localStorage.removeItem('isAuthenticated')
      this.isLoggedIn = false
      
      // 跳转到登录页面
      this.$router.push('/login')
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
