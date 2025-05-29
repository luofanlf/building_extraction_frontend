<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    
    <!-- 系统使用统计 -->
    <div class="stats-section">
      <h2>System Usage Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p class="stat-value">{{ stats.totalUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Extractions</h3>
          <p class="stat-value">{{ stats.totalExtractions }}</p>
        </div>
        <div class="stat-card">
          <h3>Active Users Today</h3>
          <p class="stat-value">{{ stats.activeUsersToday }}</p>
        </div>
        <div class="stat-card">
          <h3>Extractions Today</h3>
          <p class="stat-value">{{ stats.extractionsToday }}</p>
        </div>
      </div>
    </div>
    
    <!-- 提取次数申请列表 -->
    <div class="requests-section">
      <h2>Extraction Count Requests</h2>
      <div class="requests-list">
        <div v-if="requests.length === 0" class="no-requests">
          No pending requests
        </div>
        <div v-else class="request-item" v-for="request in requests" :key="request.id">
          <div class="request-info">
            <div class="user-info">
              <span class="username">{{ request.username }}</span>
              <span class="email">{{ request.email }}</span>
            </div>
            <div class="request-details">
              <p class="count">Requesting {{ request.count }} extractions</p>
              <p class="reason">{{ request.reason }}</p>
              <p class="time">Requested at: {{ formatDate(request.created_at) }}</p>
            </div>
          </div>
          <div class="request-actions">
            <button 
              class="btn btn-success" 
              @click="handleRequest(request.id, true)"
              :disabled="request.processing"
            >
              <span v-if="request.processing">
                <span class="loading-spinner small"></span>
                Processing...
              </span>
              <span v-else>Approve</span>
            </button>
            <button 
              class="btn btn-danger" 
              @click="handleRequest(request.id, false)"
              :disabled="request.processing"
            >
              <span v-if="request.processing">
                <span class="loading-spinner small"></span>
                Processing...
              </span>
              <span v-else>Reject</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <div class="users-section">
      <h2>User Management</h2>
      <div class="users-list">
        <div class="user-item" v-for="user in users" :key="user.id">
          <div class="user-info">
            <span class="username">{{ user.username }}</span>
            <span class="email">{{ user.email }}</span>
          </div>
          <div class="user-stats">
            <span class="stat">Total Extractions: {{ user.total_extractions }}</span>
            <span class="stat">Remaining: {{ user.remaining_count }}</span>
          </div>
          <div class="user-actions">
            <button class="btn btn-secondary" @click="showAddCountDialog(user)">
              Add Count
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加提取次数对话框 -->
    <div class="modal-overlay" v-if="showAddCountDialog" @click.self="closeAddCountDialog">
      <div class="modal-content">
        <h3>Add Extraction Count</h3>
        <div class="form-group">
          <label for="addCount">Number of Extractions:</label>
          <input 
            type="number" 
            id="addCount" 
            v-model="addCount" 
            min="1"
            placeholder="Enter the number of extractions to add"
          />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeAddCountDialog">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="submitAddCount" 
            :disabled="!addCount || isProcessing"
          >
            <span v-if="isProcessing">
              <span class="loading-spinner small"></span>
              Processing...
            </span>
            <span v-else>Add Count</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      stats: {
        totalUsers: 0,
        totalExtractions: 0,
        activeUsersToday: 0,
        extractionsToday: 0
      },
      requests: [],
      users: [],
      showAddCountDialog: false,
      selectedUser: null,
      addCount: '',
      isProcessing: false
    }
  },
  async created() {
    await this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      try {
        // 获取统计数据
        const statsResponse = await api.get('/admin/stats');
        if (statsResponse.code === 0) {
          this.stats = statsResponse.data;
        }
        
        // 获取申请列表
        const requestsResponse = await api.get('/admin/requests');
        if (requestsResponse.code === 0) {
          this.requests = requestsResponse.data;
        }
        
        // 获取用户列表
        const usersResponse = await api.get('/admin/users');
        if (usersResponse.code === 0) {
          this.users = usersResponse.data;
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    async handleRequest(requestId, approved) {
      const request = this.requests.find(r => r.id === requestId);
      if (!request) return;
      
      request.processing = true;
      try {
        const response = await api.post(`/admin/requests/${requestId}`, {
          approved: approved
        });
        
        if (response.code === 0) {
          // 从列表中移除已处理的请求
          this.requests = this.requests.filter(r => r.id !== requestId);
          // 重新加载用户列表以更新数据
          await this.loadDashboardData();
        }
      } catch (error) {
        console.error('处理请求失败:', error);
      } finally {
        request.processing = false;
      }
    },
    showAddCountDialog(user) {
      this.selectedUser = user;
      this.addCount = '';
      this.showAddCountDialog = true;
    },
    closeAddCountDialog() {
      this.showAddCountDialog = false;
      this.selectedUser = null;
      this.addCount = '';
    },
    async submitAddCount() {
      if (!this.addCount || !this.selectedUser) return;
      
      this.isProcessing = true;
      try {
        const response = await api.post(`/admin/users/${this.selectedUser.id}/add-count`, {
          count: parseInt(this.addCount)
        });
        
        if (response.code === 0) {
          this.closeAddCountDialog();
          await this.loadDashboardData();
        }
      } catch (error) {
        console.error('添加次数失败:', error);
      } finally {
        this.isProcessing = false;
      }
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f9f9fb;
  min-height: calc(100vh - 70px);
}

h1, h2, h3 {
  color: #000;
}

h1 {
  margin-bottom: 40px;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
}

.stats-section {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.stat-card h3 {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.requests-section, .users-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.no-requests {
  text-align: center;
  color: #666;
  padding: 20px;
}

.request-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-info {
  flex: 1;
}

.user-info {
  margin-bottom: 10px;
}

.username {
  font-weight: 600;
  margin-right: 10px;
}

.email {
  color: #666;
}

.request-details {
  color: #666;
}

.request-details p {
  margin: 5px 0;
}

.request-actions {
  display: flex;
  gap: 10px;
}

.user-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-stats {
  display: flex;
  gap: 20px;
}

.stat {
  color: #666;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-success {
  background-color: #4caf50;
  color: white;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 