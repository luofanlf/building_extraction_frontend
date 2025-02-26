<template>
  <div class="history-container">
    <h1>历史项目</h1>
    
    <div class="controls-bar">
      <div class="search-box">
        <input type="text" placeholder="搜索项目..." v-model="searchQuery" />
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      
      <div class="filters">
        <select v-model="filterStatus">
          <option value="all">所有状态</option>
          <option value="completed">已完成</option>
          <option value="processing">处理中</option>
          <option value="failed">失败</option>
        </select>
        
        <select v-model="sortBy">
          <option value="date-desc">最新优先</option>
          <option value="date-asc">最早优先</option>
          <option value="name-asc">名称 A-Z</option>
          <option value="name-desc">名称 Z-A</option>
        </select>
      </div>
    </div>
    
    <div class="projects-grid">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <div class="project-thumbnail">
          <img :src="project.thumbnail" alt="项目缩略图" />
          <div class="project-status" :class="project.status">
            {{ getStatusText(project.status) }}
          </div>
        </div>
        
        <div class="project-info">
          <h3>{{ project.name }}</h3>
          <p class="project-date">{{ formatDate(project.date) }}</p>
          <div class="project-stats">
            <div class="stat">
              <span class="stat-value">{{ project.buildingCount }}</span>
              <span class="stat-label">建筑物</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ project.area }}</span>
              <span class="stat-label">平方米</span>
            </div>
          </div>
        </div>
        
        <div class="project-actions">
          <button class="action-btn view-btn" @click="viewProject(project.id)">查看</button>
          <button class="action-btn export-btn" @click="exportProject(project.id)">导出</button>
          <button class="action-btn delete-btn" @click="confirmDelete(project.id)">删除</button>
        </div>
      </div>
      
      <div v-if="filteredProjects.length === 0" class="no-projects">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <h3>没有找到匹配的项目</h3>
          <p>尝试调整筛选条件或创建新项目</p>
          <button class="new-project-btn" @click="$router.push('/extract')">创建新项目</button>
        </div>
      </div>
    </div>
    
    <!-- 删除确认对话框 -->
    <div class="delete-modal" v-if="showDeleteModal">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>您确定要删除这个项目吗？此操作无法撤销。</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteModal = false">取消</button>
          <button class="confirm-btn" @click="deleteProject">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectHistory',
  data() {
    return {
      searchQuery: '',
      filterStatus: 'all',
      sortBy: 'date-desc',
      showDeleteModal: false,
      projectToDelete: null,
      projects: [
        {
          id: 1,
          name: '北京市CBD区域建筑物提取',
          date: new Date(2023, 6, 15),
          thumbnail: 'https://images.unsplash.com/photo-1545642419-d0e61a866ab1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2F0ZWxsaXRlJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
          status: 'completed',
          buildingCount: 128,
          area: '42,560'
        },
        {
          id: 2,
          name: '上海浦东新区分析',
          date: new Date(2023, 7, 3),
          thumbnail: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2F0ZWxsaXRlJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
          status: 'processing',
          buildingCount: 245,
          area: '78,950'
        },
        {
          id: 3,
          name: '广州天河区建筑提取',
          date: new Date(2023, 5, 22),
          thumbnail: 'https://images.unsplash.com/photo-1576719561108-7023141c67e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2F0ZWxsaXRlJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
          status: 'completed',
          buildingCount: 187,
          area: '56,320'
        },
        {
          id: 4,
          name: '深圳南山区分析',
          date: new Date(2023, 7, 8),
          thumbnail: 'https://images.unsplash.com/photo-1622542796254-5b9c46a804a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c2F0ZWxsaXRlJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
          status: 'failed',
          buildingCount: 0,
          area: '0'
        },
        {
          id: 5,
          name: '杭州西湖区建筑物密度分析',
          date: new Date(2023, 6, 29),
          thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c2F0ZWxsaXRlJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
          status: 'completed',
          buildingCount: 94,
          area: '31,240'
        }
      ]
    }
  },
  computed: {
    filteredProjects() {
      let result = [...this.projects]
      
      // 应用搜索筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(project => project.name.toLowerCase().includes(query))
      }
      
      // 应用状态筛选
      if (this.filterStatus !== 'all') {
        result = result.filter(project => project.status === this.filterStatus)
      }
      
      // 应用排序
      switch(this.sortBy) {
        case 'date-desc':
          result.sort((a, b) => b.date - a.date)
          break
        case 'date-asc':
          result.sort((a, b) => a.date - b.date)
          break
        case 'name-asc':
          result.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'name-desc':
          result.sort((a, b) => b.name.localeCompare(a.name))
          break
      }
      
      return result
    }
  },
  methods: {
    formatDate(date) {
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    },
    getStatusText(status) {
      const statusMap = {
        'completed': '已完成',
        'processing': '处理中',
        'failed': '失败'
      }
      return statusMap[status] || status
    },
    viewProject(id) {
      console.log('查看项目:', id)
      // 导航到项目详情页
      this.$router.push(`/project/${id}`)
    },
    exportProject(id) {
      console.log('导出项目:', id)
      // 实现项目导出逻辑
    },
    confirmDelete(id) {
      this.projectToDelete = id
      this.showDeleteModal = true
    },
    deleteProject() {
      console.log('删除项目:', this.projectToDelete)
      // 从项目列表中移除项目
      this.projects = this.projects.filter(p => p.id !== this.projectToDelete)
      this.showDeleteModal = false
      this.projectToDelete = null
    }
  }
}
</script>

<style scoped>
.history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  color: #0d0c22;
  margin-bottom: 40px;
  text-align: center;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6e6d7a;
}

.filters {
  display: flex;
  gap: 16px;
}

.filters select {
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  color: #0d0c22;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.project-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.project-thumbnail {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.project-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.project-status.completed {
  background-color: #d1fad7;
  color: #2a9d8f;
}

.project-status.processing {
  background-color: #d1e3fa;
  color: #3a86ff;
}

.project-status.failed {
  background-color: #fad1d1;
  color: #e63946;
}

.project-info {
  padding: 16px;
}

.project-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #0d0c22;
}

.project-date {
  color: #6e6d7a;
  font-size: 14px;
  margin-bottom: 16px;
}

.project-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-weight: 600;
  color: #ea4c89;
}

.stat-label {
  font-size: 12px;
  color: #6e6d7a;
}

.project-actions {
  display: flex;
  padding: 0 16px 16px;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-btn {
  background-color: #f4f4f4;
  color: #0d0c22;
}

.view-btn:hover {
  background-color: #e9e9e9;
}

.export-btn {
  background-color: #d1fad7;
  color: #2a9d8f;
}

.export-btn:hover {
  background-color: #c0f0c6;
}

.delete-btn {
  background-color: #fad1d1;
  color: #e63946;
}

.delete-btn:hover {
  background-color: #f5c0c0;
}

.no-projects {
  grid-column: 1 / -1;
  padding: 60px 0;
}

.empty-state {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

.empty-state svg {
  color: #e0e0e0;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #0d0c22;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6e6d7a;
  margin-bottom: 24px;
}

.new-project-btn {
  background-color: #ea4c89;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-project-btn:hover {
  background-color: #df3e7b;
}

.delete-modal {
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
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 12px;
}

.modal-content p {
  margin-bottom: 24px;
  color: #6e6d7a;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.cancel-btn {
  background-color: #f4f4f4;
  color: #0d0c22;
}

.confirm-btn {
  background-color: #ea4c89;
  color: white;
}

@media (max-width: 768px) {
  .controls-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style> 