<template>
  <div class="history-container">
    <h1>Project History</h1>
    
    <div class="controls-bar">
      <div class="search-box">
        <input type="text" placeholder="Search projects..." v-model="searchQuery" />
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      
      <div class="filters">
        <select v-model="selectedModel" class="filter-select">
          <option value="all">All Models</option>
          <option v-for="model in availableModels" :key="model" :value="model">
            {{ model }}
          </option>
        </select>
        
        <select v-model="sortBy" class="filter-select">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </div>
    </div>
    
    <div class="loading-indicator" v-if="isLoading">
      <div class="spinner"></div>
      <p>Loading projects...</p>
    </div>
    
    <div class="projects-grid" v-else>
      <div v-for="project in filteredProjects" :key="project.ID" class="project-card">
        <div class="project-thumbnail">
          <img :src="getImageUrl(project.input_image)" alt="Project input image" />
        </div>
        
        <div class="project-info">
          <h3>{{ project.name }}</h3>
          <p class="project-date">{{ formatDate(project.created_at) }}</p>
          <div class="project-stats">
            <div class="stat">
              <span class="stat-value">{{ project.model }}</span>
              <span class="stat-label">Model</span>
            </div>
          </div>
        </div>
        
        <div class="project-actions">
          <button class="action-btn view-btn" @click="viewProject(project)">View</button>
          <button class="action-btn export-btn" @click="exportProject(project.ID)">Export</button>
          <button class="action-btn delete-btn" @click="confirmDelete(project)">Delete</button>
        </div>
      </div>
      
      <div v-if="filteredProjects.length === 0 && !isLoading" class="no-projects">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <h3>No matching projects found</h3>
          <p>Try adjusting your filters or create a new project</p>
          <button class="btn" @click="$router.push('/extract')">Create New Project</button>
        </div>
      </div>
    </div>
    
    <!-- Delete confirmation dialog -->
    <div class="delete-modal" v-if="showDeleteModal">
      <div class="modal-content">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this project? This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="confirm-btn" @click="deleteProject">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js';

export default {
  name: 'ProjectHistory',
  data() {
    return {
      searchQuery: '',
      sortBy: 'date-desc',
      selectedModel: 'all',
      showDeleteModal: false,
      projectToDelete: null,
      isLoading: true,
      projects: [],
      error: null
    }
  },
  created() {
    // 组件创建时获取项目数据
    this.fetchProjects();
  },
  computed: {
    // 获取所有可用的模型类型
    availableModels() {
      const models = new Set(this.projects.map(project => project.model));
      return Array.from(models).sort();
    },
    
    filteredProjects() {
      let result = [...this.projects]
      
      // 应用模型筛选
      if (this.selectedModel !== 'all') {
        result = result.filter(project => project.model === this.selectedModel);
      }
      
      // 应用搜索筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(project => project.name.toLowerCase().includes(query))
      }
      
      // 应用排序
      switch(this.sortBy) {
        case 'date-desc':
          result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
        case 'date-asc':
          result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
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
    async fetchProjects() {
      try {
        this.isLoading = true;
        this.error = null;
        
        // 调用API获取项目列表
        const response = await api.get('/projects');
        
        console.log('Projects response:', response);
        
        // 设置项目数据
        if (response.data && Array.isArray(response.data)) {
          this.projects = response.data;
        } else if (response.data && response.data.code === 0 && Array.isArray(response.data.data)) {
          this.projects = response.data.data;
        } else {
          console.error('Unexpected projects response format:', response.data);
          this.error = 'Failed to load projects due to unexpected response format';
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        this.error = 'Failed to load projects. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(date) {
      if (!date) return 'N/A';
      
      try {
        // 尝试直接解析
        let dateObj = new Date(date);
        
        // 检查是否为有效日期
        if (isNaN(dateObj.getTime())) {
          // 如果无效，尝试手动格式化
          // 处理格式如 "2025-03-03 03:07:08.060819+00"
          const parts = date.split(/[- :.+]/);
          if (parts.length >= 6) {
            // 按照 YYYY, MM-1, DD, HH, MM, SS 创建日期
            // 注意月份需要减1，因为JavaScript中月份是从0开始的
            dateObj = new Date(
              parseInt(parts[0]), 
              parseInt(parts[1]) - 1, 
              parseInt(parts[2]), 
              parseInt(parts[3]), 
              parseInt(parts[4]), 
              parseInt(parts[5])
            );
          }
        }
        
        // 如果还是无效日期，返回原始字符串
        if (isNaN(dateObj.getTime())) {
          console.warn('Could not parse date:', date);
          return date;
        }
        
        // 格式化日期
        return dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Error formatting date:', error);
        return date; // 返回原始日期字符串作为后备
      }
    },
    getImageUrl(imagePath) {
      // 处理图片URL路径
      if (!imagePath) return '';
      
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      
      // 添加API基础URL
      const baseUrl = process.env.VUE_APP_API_URL || 'http://localhost:8080';
      return imagePath.startsWith('/') ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`;
    },
    viewProject(project) {
      console.log('Viewing project:', project);
      
      // 尝试不同的ID字段名称（根据后端返回的实际数据结构调整）
      const projectId = project.id;
      
      if (!projectId) {
        console.error('No project ID found in:', project);
        alert('Cannot view project: ID not found');
        return;
      }
      
      console.log('Navigating to project with ID:', projectId);
      this.$router.push(`/project/${projectId}`);
    },
    async exportProject(id) {
      console.log('Exporting project:', id);
      try {
        // 调用导出API
        const response = await api.get(`/project/${id}/export`);
        
        // 检查是否返回了下载URL
        if (response.data && response.data.downloadUrl) {
          // 创建隐藏的下载链接并触发点击
          const downloadLink = document.createElement('a');
          downloadLink.href = this.getImageUrl(response.data.downloadUrl);
          downloadLink.download = `project-${id}-export.zip`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } else {
          console.error('No download URL in export response:', response);
          alert('Export failed: No download URL provided');
        }
      } catch (error) {
        console.error('Error exporting project:', error);
        alert('Failed to export project. Please try again.');
      }
    },
    confirmDelete(project) {
      // 尝试从不同的可能字段名获取ID
      const projectId = project.id || project.ID || project._id;
      
      console.log('Project to delete:', project);
      console.log('Project ID found:', projectId);
      
      if (!projectId) {
        console.error('Cannot delete: No ID found in project', project);
        alert('Cannot delete project: ID not found');
        return;
      }
      
      this.projectToDelete = projectId;
      this.showDeleteModal = true;
    },
    async deleteProject() {
      try {
        console.log('Deleting project with ID:', this.projectToDelete);
        
        // 调用删除API - 使用正确的URL格式
        await api.delete(`/projects/${this.projectToDelete}`);
        
        // 从项目列表中移除项目 - 确保使用相同的ID字段名
        this.projects = this.projects.filter(p => {
          const pId = p.id || p.ID || p._id;
          return pId !== this.projectToDelete;
        });
        
        console.log('Project deleted successfully');
        this.showDeleteModal = false;
        this.projectToDelete = null;
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  }
}
</script>

<style scoped>
/* 添加加载指示器样式 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 保留原始样式 */
.history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f9f9fb;
  min-height: calc(100vh - 70px);
}

h1 {
  color: #000;
  margin-bottom: 40px;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
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
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filters {
  display: flex;
  gap: 16px;
}

.filters select {
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  color: #000;
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
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
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

.project-info {
  padding: 20px;
}

.project-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #000;
  font-weight: 600;
}

.project-date {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.project-stats {
  display: flex;
  gap: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-weight: 600;
  color: #000;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.project-actions {
  display: flex;
  padding: 0 20px 20px;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn {
  background-color: #f5f5f5;
  color: #000;
}

.view-btn:hover {
  background-color: #e9e9e9;
}

.export-btn {
  background-color: #eef9f2;
  color: #227855;
}

.export-btn:hover {
  background-color: #ddf1e6;
}

.delete-btn {
  background-color: #fcf1ee;
  color: #cc3a2f;
}

.delete-btn:hover {
  background-color: #f9e3de;
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
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #000;
  margin-bottom: 8px;
  font-weight: 600;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

.btn {
  background-color: #000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background-color: #333;
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
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #000;
  font-weight: 600;
}

.modal-content p {
  margin-bottom: 24px;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 16px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #000;
}

.cancel-btn:hover {
  background-color: #e9e9e9;
}

.confirm-btn {
  background-color: #000;
  color: white;
}

.confirm-btn:hover {
  background-color: #333;
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

/* 添加一个样式来保持下拉框之间的一致性 */
.filter-select {
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  color: #000;
}
</style> 