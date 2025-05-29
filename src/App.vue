<template>
  <div id="app">
    <nav-bar />
    <div class="content-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'

export default {
  name: 'App',
  components: {
    NavBar
  },
  data() {
    return {
      isAdmin: false
    }
  },
  async created() {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      this.isAdmin = data.code === 0 && data.data && data.data.is_admin
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #000000;
  --secondary-color: #555555;
  --accent-color: #4361ee;
  --background-color: #ffffff;
  --light-bg-color: #f9f9fb;
  --border-color: #e8e8e8;
  --text-color: #333333;
  --light-text-color: #666666;
  --border-radius: 8px;
  --transition-speed: 0.2s;
}

.content-container {
  margin-top: 70px;
  min-height: calc(100vh - 70px);
  background-color: var(--light-bg-color);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--primary-color);
  font-weight: 600;
  letter-spacing: -0.5px;
}

a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color var(--transition-speed);
}

a:hover {
  color: var(--primary-color);
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed);
  text-align: center;
}

.btn:hover {
  background-color: #333333;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: rgba(0,0,0,0.05);
  color: var(--primary-color);
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

section {
  padding: 60px 0;
}

.card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
</style>
