<template>
  <div class="admin-container">
    <h1>管理员控制面板</h1>
    <div class="admin-content">
      <div class="admin-section">
        <h2>用户管理</h2>
        <div class="admin-card">
          <h3>用户统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">总用户数</span>
              <span class="stat-value">{{ totalUsers }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">今日新增</span>
              <span class="stat-value">{{ newUsersToday }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js';

export default {
  name: 'Admin',
  data() {
    return {
      totalUsers: 0,
      newUsersToday: 0
    }
  },
  async created() {
    // 检查是否是管理员
    try {
      const response = await api.get('/user/profile');
      if (!response.data.is_admin) {
        this.$router.push('/');
      }
    } catch (error) {
      console.error('权限检查失败:', error);
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.admin-container {
  padding: 80px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-content {
  margin-top: 30px;
}

.admin-section {
  margin-bottom: 40px;
}

.admin-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.admin-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.admin-card h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #444;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}
</style> 