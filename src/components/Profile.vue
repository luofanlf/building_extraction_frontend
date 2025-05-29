<template>
  <div class="profile-container">
    <div class="profile-content">
      <h1>Profile</h1>
      
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>Loading Failed</h3>
        <p>{{ error }}</p>
        <button class="btn" @click="fetchUserProfile">Retry</button>
      </div>
      
      <div v-else class="profile-sections">
        <!-- User Information Section -->
        <div class="profile-section">
          <div class="section-header">
            <h2>Account Information</h2>
          </div>
          
          <div class="section-content">
            <div class="avatar-section">
              <div class="avatar">
                <span class="avatar-placeholder">{{ userInitial }}</span>
              </div>
              <div class="avatar-info">
                <h3>{{ userProfile.username }}</h3>
                <p class="user-email">Email Address</p>
              </div>
            </div>
            
            <div class="usage-stats">
              <div class="stat-item">
                <div class="stat-value">{{ userProfile.extraction_count }}</div>
                <div class="stat-label">Extractions Used</div>
              </div>
              
              <div class="stat-item">
                <div class="stat-value">{{ userProfile.remaining_count }}</div>
                <div class="stat-label">Remaining Extractions</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Security Settings Section -->
        <div class="profile-section">
          <div class="section-header">
            <h2>Security Settings</h2>
            <button class="edit-btn" @click="toggleEditMode('security')">
              {{ isEditing.security ? 'Save' : 'Change Password' }}
            </button>
          </div>
          
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item">
                <label>Current Password</label>
                <input 
                  v-if="isEditing.security" 
                  type="password" 
                  v-model="editForm.currentPassword"
                  placeholder="Enter current password"
                />
                <span v-else>••••••••</span>
              </div>
              
              <div class="info-item">
                <label>New Password</label>
                <input 
                  v-if="isEditing.security" 
                  type="password" 
                  v-model="editForm.newPassword"
                  placeholder="Enter new password"
                />
                <span v-else>••••••••</span>
              </div>
              
              <div class="info-item">
                <label>Confirm New Password</label>
                <input 
                  v-if="isEditing.security" 
                  type="password" 
                  v-model="editForm.confirmPassword"
                  placeholder="Confirm new password"
                />
                <span v-else>••••••••</span>
              </div>
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
  name: 'ProfilePage',
  data() {
    return {
      isLoading: true,
      error: null,
      userProfile: {},
      isEditing: {
        security: false
      },
      editForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    userInitial() {
      return this.userProfile.username ? this.userProfile.username.charAt(0).toUpperCase() : 'U';
    }
  },
  created() {
    this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      try {
        this.isLoading = true;
        this.error = null;
        
        const response = await api.get('/user/profile');
        
        if (response && response.data) {
          this.userProfile = response.data;
        } else {
          throw new Error('Failed to fetch user information');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.error = 'Failed to load user information. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    
    toggleEditMode(section) {
      if (this.isEditing[section]) {
        // Save changes
        this.saveChanges(section);
      } else {
        // Enter edit mode
        this.isEditing[section] = true;
      }
    },
    
    async saveChanges(section) {
      try {
        if (section === 'security') {
          // Validate new password
          if (this.editForm.newPassword !== this.editForm.confirmPassword) {
            alert('Passwords do not match');
            return;
          }
          
          // Save password
          const response = await api.put('/user/password', {
            current_password: this.editForm.currentPassword,
            new_password: this.editForm.newPassword
          });
          
          if (response && response.code === 0) {
            this.isEditing.security = false;
            // Clear password fields
            this.editForm.currentPassword = '';
            this.editForm.newPassword = '';
            this.editForm.confirmPassword = '';
            alert('Password updated successfully');
          }
        }
      } catch (error) {
        console.error('Error saving changes:', error);
        alert('Failed to save changes. Please try again later.');
      }
    }
  }
}
</script>

<style scoped>
.profile-container {
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 40px 20px;
  background-color: #f9f9fb;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #000;
  margin-bottom: 40px;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #000;
}

.edit-btn {
  padding: 8px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: white;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #f5f5f5;
}

.section-content {
  padding: 20px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-placeholder {
  color: white;
  font-size: 32px;
  font-weight: 600;
}

.avatar-info h3 {
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 600;
  color: #000;
}

.user-email {
  color: #666;
  margin: 0;
}

.usage-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.stat-item {
  padding: 20px;
  background: #f9f9fb;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-item input {
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s;
}

.info-item input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.info-item span {
  font-size: 16px;
  color: #000;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #000;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg {
  color: #f44336;
  margin-bottom: 16px;
}

.error-state h3 {
  margin-bottom: 8px;
  font-weight: 600;
}

.error-state p {
  color: #666;
  margin-bottom: 24px;
}

.btn {
  padding: 12px 24px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background-color: #333;
}
</style> 