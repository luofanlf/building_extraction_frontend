<template>
  <nav class="nav-bar">
    <div class="container">
      <!-- 品牌标识 -->
      <div class="nav-bar-brand">
        <router-link to="/">Uncerscape</router-link>
      </div>
      
      <!-- 主导航菜单 -->
      <div class="nav-bar-menu" :class="{ 'active': isMenuActive }">
        <div class="nav-bar-links">
          <router-link to="/home" class="nav-bar-item">Home</router-link>
          <router-link to="/about" class="nav-bar-item">About</router-link>
          <router-link to="/extract" class="nav-bar-item">Try Uncerscape</router-link>
          <router-link to="/history" class="nav-bar-item">History</router-link>
        </div>
      </div>
      
      <!-- 用户操作区域 -->
      <div class="nav-bar-auth">
        <template v-if="isLoggedIn">
          <div class="user-profile" @click="toggleUserMenu">
            <div class="user-avatar">
              <span class="avatar-placeholder">{{ userInitial }}</span>
            </div>
            <span class="username">User</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-icon"><polyline points="6 9 12 15 18 9"></polyline></svg>
            
            <div class="dropdown-menu" :class="{ 'show': showUserMenu }">
              <router-link to="/profile" class="dropdown-item">个人设置</router-link>
              <div class="dropdown-divider"></div>
              <a @click="logout" class="dropdown-item logout-item">退出登录</a>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="login-btn">Sign in</router-link>
          <router-link to="/register" class="signup-btn">Sign up</router-link>
        </template>
      </div>
      
      <!-- 移动端菜单按钮 -->
      <div class="menu-toggle" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      isMenuActive: false,
      isLoggedIn: false,
      showUserMenu: false,
      username: 'User'
    }
  },
  computed: {
    userInitial() {
      return this.username.charAt(0).toUpperCase();
    }
  },
  created() {
    // 检查登录状态
    this.checkLoginStatus();
    
    // 监听登录状态变化
    window.addEventListener('storage', this.checkLoginStatus);
    
    // 点击其他地方关闭用户菜单
    document.addEventListener('click', this.closeUserMenuOnClickOutside);
  },
  beforeUnmount() {
    // 移除事件监听
    window.removeEventListener('storage', this.checkLoginStatus);
    document.removeEventListener('click', this.closeUserMenuOnClickOutside);
  },
  methods: {
    toggleMenu() {
      this.isMenuActive = !this.isMenuActive;
    },
    toggleUserMenu(event) {
      // 阻止事件冒泡，避免立即被document的点击事件处理
      event.stopPropagation();
      this.showUserMenu = !this.showUserMenu;
    },
    closeUserMenuOnClickOutside(event) {
      // 判断点击是否在用户菜单区域外
      const userProfile = document.querySelector('.user-profile');
      if (userProfile && !userProfile.contains(event.target)) {
        this.showUserMenu = false;
      }
    },
    checkLoginStatus() {
      this.isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
      console.log('Login status:', this.isLoggedIn); // 调试信息
    },
    logout() {
      localStorage.removeItem('isAuthenticated');
      this.showUserMenu = false;
      window.dispatchEvent(new Event('storage'));
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.nav-bar {
  background-color: white;
  border-bottom: 1px solid #e8e8e8;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 70px;
  display: flex;
  align-items: center;
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-bar-brand {
  font-size: 35px;
  font-weight: 700;
}

.nav-bar-brand a {
  color: #000;
  text-decoration: none;
  letter-spacing: -0.5px;
}

.nav-bar-menu {
  display: flex;
  align-items: center;
}

.nav-bar-links {
  display: flex;
  gap: 30px;
}

.nav-bar-item {
  color: #555;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-bar-item:hover, .nav-bar-item.router-link-active {
  color: #000;
}

.nav-bar-auth {
  display: flex;
  align-items: center;
  gap: 15px;
}

.login-btn, .signup-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.login-btn {
  color: #555;
}

.login-btn:hover {
  color: #000;
  background-color: rgba(0,0,0,0.05);
}

.signup-btn {
  background-color: #000;
  color: #fff;
}

.signup-btn:hover {
  background-color: #333;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.user-profile:hover {
  background-color: rgba(0,0,0,0.05);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-placeholder {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.dropdown-icon {
  color: #555;
  transition: transform 0.2s;
}

.user-profile:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 45px;
  right: 0;
  width: 180px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  display: none;
  overflow: hidden;
  z-index: 1010;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: block;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-divider {
  height: 1px;
  background-color: #e8e8e8;
  margin: 4px 0;
}

.logout-item {
  color: #e53935;
}

.logout-item:hover {
  background-color: rgba(229, 57, 53, 0.1);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}

.menu-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background-color: #000;
  transition: all 0.3s;
}

@media (max-width: 768px) {
  .nav-bar-menu {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: white;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    flex-direction: column;
    align-items: flex-start;
    transform: translateY(-100%);
    opacity: 0;
    transition: all 0.3s;
    visibility: hidden;
  }
  
  .nav-bar-menu.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .nav-bar-links {
    flex-direction: column;
    width: 100%;
  }
  
  .nav-bar-item {
    display: block;
    padding: 12px 0;
    width: 100%;
  }
  
  .menu-toggle {
    display: flex;
  }
  
  .nav-bar-auth {
    margin-left: auto;
  }
}
</style> 