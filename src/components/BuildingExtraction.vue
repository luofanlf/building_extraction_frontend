<template>
  <div class="extraction-container">
    <h1>Building Extraction</h1>
    
    <div class="upload-section">
      <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
        <input type="file" ref="fileInput" @change="handleFileSelected" accept="image/*,.tif,.tiff" style="display: none" />
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <p>Drag and drop remote sensing images here, or click to upload</p>
        <button class="btn">Upload</button>
      </div>
    </div>
    
    <div class="preview-section" v-if="imagePreview">
      <div class="preview-container">
        <h2>Image Preview</h2>
        <img :src="imagePreview" alt="Preview" class="preview-image" />
      </div>
      
      <div class="extraction-controls">
        <h2>Extraction Parameters</h2>
        
        <div class="control-group">
          <label for="algorithm">Algorithm Selection:</label>
          <select id="algorithm" v-model="selectedAlgorithm">
            <option value="unet">U-Net</option>
            <option value="maskrcnn">Mask R-CNN</option>
            <option value="deeplab">DeepLab v3+</option>
          </select>
        </div>

        <!-- 添加剩余次数显示和申请按钮 -->
        <div class="remaining-count">
          <div class="count-info">
            <span class="count-label">Remaining Extractions:</span>
            <span class="count-value">{{ remainingCount }}</span>
          </div>
          <button class="btn btn-secondary" @click="showRequestDialog">
            Request More
          </button>
        </div>
        
        <button class="btn" @click="startExtraction" :disabled="isProcessing || !originalImage || remainingCount <= 0">
          <span v-if="isProcessing">
            <span class="loading-spinner"></span>
            processing ({{ processingTime }}s)
          </span>
          <span v-else>start extraction</span>
        </button>
        
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </div>
    </div>
    
    <div class="result-section" v-if="showResults">
      <h2>Extraction Results</h2>
      <div class="result-image-container">
        <img :src="resultImage" alt="Extraction Result" class="result-image" />
      </div>
      <div class="result-stats">
        <div class="stat-item">
          <h3>Buildings Detected</h3>
          <p>{{ extractionStats.buildingsCount || 0 }}</p>
        </div>
        <div class="stat-item">
          <h3>Total Area</h3>
          <p>{{ extractionStats.totalArea || 0 }} m²</p>
        </div>
        <div class="stat-item">
          <h3>Average Building Size</h3>
          <p>{{ extractionStats.averageSize || 0 }} m²</p>
        </div>
      </div>
      <div class="result-actions">
        <button class="btn btn-secondary" @click="downloadResult">export result</button>
        <button class="btn btn-primary" @click="showSaveProjectDialog">save project</button>
      </div>
    </div>
    
    <!-- 保存项目模态对话框 -->
    <div class="modal-overlay" v-if="showSaveDialog" @click.self="cancelSaveProject">
      <div class="modal-content">
        <h3>save project</h3>
        <div class="form-group">
          <label for="projectName">project name</label>
          <input 
            type="text" 
            id="projectName" 
            v-model="projectName" 
            placeholder="please enter a name for your project"
            @keyup.enter="saveProject"
          />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cancelSaveProject">cancel</button>
          <button class="btn btn-primary" @click="saveProject" :disabled="!projectName.trim()">
            <span v-if="isSaving">
              <span class="loading-spinner small"></span>
              saving...
            </span>
            <span v-else>save</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 添加一个简单的通知组件 -->
    <div class="notification" v-if="notification.show" :class="notification.type">
      {{ notification.message }}
      <span class="close-notification" @click="closeNotification">&times;</span>
    </div>

    <!-- 添加申请提取次数对话框 -->
    <div class="modal-overlay" v-if="showRequestForm" @click.self="closeRequestDialog">
      <div class="modal-content">
        <h3>Request Extraction Count</h3>
        <div class="form-group">
          <label for="requestCount">Number of Extractions:</label>
          <div class="count-control">
            <button class="count-btn" @click="decreaseRequestCount">-</button>
            <input 
              type="number" 
              id="requestCount" 
              v-model="requestCount" 
              min="1"
              readonly
            />
            <button class="count-btn" @click="increaseRequestCount">+</button>
          </div>
        </div>
        <div class="form-group">
          <label for="requestReason">Reason for Request:</label>
          <textarea 
            id="requestReason" 
            v-model="requestReason" 
            placeholder="Please explain why you need more extractions"
            rows="4"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeRequestDialog">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="submitRequest" 
            :disabled="!requestCount || !requestReason.trim() || isSubmitting"
          >
            <span v-if="isSubmitting">
              <span class="loading-spinner small"></span>
              Submitting...
            </span>
            <span v-else>Submit Request</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js';
import Tiff from 'tiff.js';

export default {
  name: 'BuildingExtraction',
  data() {
    return {
      imagePreview: '',
      selectedAlgorithm: 'unet',
      showResults: false,
      isProcessing: false,
      errorMessage: null,
      resultImage: '',
      extractionStats: {
        buildingsCount: 0,
        totalArea: 0,
        averageSize: 0
      },
      originalImage: null,
      processingTimer: null,
      processingTime: 0,
      showSaveDialog: false,
      projectName: '',
      isSaving: false,
      inputImagePath: '',
      outputImagePath: '',
      // 添加通知相关数据
      notification: {
        show: false,
        message: '',
        type: 'success', // 'success' 或 'error'
        timeout: null
      },
      remainingCount: 0,
      showRequestForm: false,
      requestCount: 1,
      requestReason: '',
      isSubmitting: false,
    }
  },
  async created() {
    // 获取用户剩余次数
    await this.loadRemainingCount();
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileSelected(event) {
      const file = event.target.files[0]
      if (file) {
        this.processImage(file)
      }
    },
    handleFileDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file) {
        this.processImage(file)
      }
    },
    async processImage(file) {
      // 验证文件类型
      const validTypes = ['image/tiff', 'image/tif', 'image/jpeg', 'image/png', 'image/gif'];
      const isTiff = file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff');
      
      if (!validTypes.includes(file.type) && !isTiff) {
        this.errorMessage = 'Please upload supported image formats (JPG, PNG, GIF, TIF)';
        return;
      }
      
      // 验证文件大小 (限制为20MB)
      if (file.size > 20 * 1024 * 1024) {
        this.errorMessage = 'Image size cannot exceed 20MB';
        return;
      }
      
      // 存储原始图片数据
      this.originalImage = file;
      
      try {
        // 如果是TIFF格式，需要特殊处理
        if (isTiff) {
          const arrayBuffer = await file.arrayBuffer();
          const tiff = new Tiff({ buffer: arrayBuffer });
          const canvas = tiff.toCanvas();
          this.imagePreview = canvas.toDataURL('image/png');
        } else {
          // 其他格式使用普通的FileReader
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagePreview = e.target.result;
          };
          reader.readAsDataURL(file);
        }
        
        this.errorMessage = null;
        this.showResults = false;
      } catch (error) {
        console.error('图片处理错误:', error);
        this.errorMessage = '图片处理失败，请确保文件格式正确';
      }
    },
    async startExtraction() {
      if (!this.originalImage) {
        this.errorMessage = 'please select image';
        return;
      }
      
      try {
        this.isProcessing = true;
        this.errorMessage = null;
        this.showResults = false;
        
        // 开始计时
        this.processingTime = 0;
        this.processingTimer = setInterval(() => {
          this.processingTime++;
        }, 1000);
        
        const formData = new FormData();
        
        const isTiff = this.originalImage.name.toLowerCase().endsWith('.tif') || 
                      this.originalImage.name.toLowerCase().endsWith('.tiff');
        
        if (isTiff) {
          const response = await fetch(this.imagePreview);
          const blob = await response.blob();
          formData.append('image', blob, 'converted.png');
        } else {
          formData.append('image', this.originalImage);
        }
        
        formData.append('algorithm', this.selectedAlgorithm);
        
        const response = await api.post('/extraction', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 300000, // 5分钟超时
        });
        
        console.log('服务器响应:', response);
        
        // 根据明确的后端响应格式获取mask_url和其他图片路径
        if (response && response.code === 0 && response.data && response.data.mask_url) {
          let maskUrl = response.data.mask_url;
          console.log('获取到的mask_url:', maskUrl);
          
          // 保存input_image和output_image路径
          this.inputImagePath = response.data.input_image || '';
          this.outputImagePath = response.data.output_image || '';
          console.log('输入图片路径:', this.inputImagePath);
          console.log('输出图片路径:', this.outputImagePath);
          
          // 检查maskUrl是否已经是完整URL
          if (maskUrl.startsWith('http://') || maskUrl.startsWith('https://')) {
            this.resultImage = maskUrl;
          } else {
            // 否则构建完整URL
            const baseUrl = process.env.VUE_APP_API_URL || '';
            
            // 移除URL开头的"./"
            if (maskUrl.startsWith('./')) {
              maskUrl = maskUrl.substring(2);
            }
            
            // 确保URL以"/"开头
            if (!maskUrl.startsWith('/')) {
              maskUrl = '/' + maskUrl;
            }
            
            this.resultImage = baseUrl + maskUrl;
          }
          
          console.log('最终设置的结果图像URL:', this.resultImage);
          
          // 设置统计信息占位符
          this.extractionStats = {
            buildingsCount: 'N/A',
            totalArea: 'N/A',
            averageSize: 'N/A'
          };
          
          // 显示结果区域
          this.showResults = true;
          console.log('结果区域已显示');
          this.errorMessage = null;
          // 更新剩余次数
          await this.loadRemainingCount();
        } else {
          console.error('无法从响应中获取mask_url', JSON.stringify(response));
          throw new Error('服务器返回的数据格式不正确，无法获取掩码图片URL');
        }
        
        console.log('提取过程结束');
      } catch (error) {
        console.error('提取过程中的错误:', error);
        console.error('错误响应数据:', error.response?.data);
        
        if (error.code === 'ECONNABORTED') {
          this.errorMessage = '请求超时，请重试或联系管理员';
        } else if (error.response?.data) {
          // 处理后端返回的错误信息
          const errorData = error.response.data;
          console.log('错误数据结构:', errorData);
          this.errorMessage = errorData.err || '提取失败，请重试';
          this.showNotification('error', errorData.err || '提取失败，请重试');
        } else {
          this.errorMessage = error.message || '处理过程中出错，请重试';
        }
      } finally {
        this.isProcessing = false;
        // 清除计时器
        if (this.processingTimer) {
          clearInterval(this.processingTimer);
          this.processingTimer = null;
        }
      }
    },
    exportResults() {
      // 导出结果功能
      console.log('Exporting results');
      // 实现导出功能
    },
    showSaveProjectDialog() {
      this.showSaveDialog = true;
      this.projectName = ''; // 清空之前的输入
      // 自动聚焦到输入框
      setTimeout(() => {
        document.getElementById('projectName').focus();
      }, 100);
    },
    cancelSaveProject() {
      this.showSaveDialog = false;
    },
    async saveProject() {
      if (!this.projectName.trim()) {
        return;
      }
      
      try {
        this.isSaving = true;
        
        // 准备要发送的数据，包含input_image和output_image路径
        const projectData = {
          name: this.projectName.trim(),
          model: this.selectedAlgorithm,
          input_image: this.inputImagePath,
          output_image: this.outputImagePath,
        };
        
        console.log('发送保存项目请求:', projectData);
        
        // 发送请求到后端
        const response = await api.post('/projects', projectData);
        
        console.log('项目保存成功:', response);
        
        // 关闭对话框
        this.showSaveDialog = false;
        
        // 直接显示成功通知（英文）
        this.showNotification('success', 'Project saved successfully');
        
      } catch (error) {
        console.error('保存项目失败:', error);
        this.showNotification('error', 'Failed to save project: ' + (error.message || 'Unknown error'));
      } finally {
        this.isSaving = false;
      }
    },
    // 添加显示通知的方法
    showNotification(type, message) {
      // 清除之前的定时器
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
      }
      
      // 设置通知内容
      this.notification = {
        show: true,
        type: type,
        message: message,
        timeout: setTimeout(() => {
          this.closeNotification();
        }, 3000) // 3秒后自动关闭
      };
    },
    // 关闭通知的方法
    closeNotification() {
      this.notification.show = false;
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
        this.notification.timeout = null;
      }
    },
    async loadRemainingCount() {
      try {
        const response = await api.get('/user/profile');
        if (response.code === 0 && response.data) {
          this.remainingCount = response.data.remaining_count || 0;
        }
      } catch (error) {
        console.error('获取剩余次数失败:', error);
      }
    },
    showRequestDialog() {
      this.showRequestForm = true;
      this.requestCount = 1;
      this.requestReason = '';
    },
    closeRequestDialog() {
      this.showRequestForm = false;
      this.requestCount = 1;
      this.requestReason = '';
    },
    increaseRequestCount() {
      this.requestCount++;
    },
    decreaseRequestCount() {
      if (this.requestCount > 1) {
        this.requestCount--;
      }
    },
    async submitRequest() {
      if (!this.requestCount || !this.requestReason.trim()) return;
      
      this.isSubmitting = true;
      try {
        const response = await api.post('/requests', {
          request_count: this.requestCount,
          reason: this.requestReason.trim()
        });
        
        if (response.code === 0) {
          this.showNotification('success', '申请已提交，请等待管理员审核');
          this.closeRequestDialog();
        } else {
          this.showNotification('error', response.err || '申请提交失败');
        }
      } catch (error) {
        console.error('提交申请失败:', error);
        this.showNotification('error', '申请提交失败，请稍后重试');
      } finally {
        this.isSubmitting = false;
      }
    },
  }
}
</script>

<style scoped>
.extraction-container {
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

.upload-section {
  margin-bottom: 40px;
}

.upload-area {
  border: 2px dashed #e8e8e8;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  background-color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #000;
}

.upload-icon {
  margin-bottom: 20px;
  color: #666;
}

.upload-area p {
  color: #666;
  margin-bottom: 24px;
  font-size: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  min-width: 150px;
}

.btn:hover {
  background-color: #333;
  transform: translateY(-1px);
}

.btn:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-block;
  padding: 12px 28px;
  background-color: transparent;
  color: #000;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-secondary:hover {
  background-color: rgba(0,0,0,0.05);
}

.preview-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.preview-image {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.extraction-controls {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
}

.control-group {
  margin-bottom: 30px;
}

.control-group label {
  display: block;
  margin-bottom: 10px;
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  color: #000;
}

.error-message {
  margin-top: 20px;
  padding: 12px;
  background-color: #fdf3f3;
  color: #c22f2f;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #f2c3c3;
}

.result-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
}

.result-image {
  max-width: 100%;
  border-radius: 12px;
  margin-bottom: 30px;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: #f9f9fb;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.stat-item h3 {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 500;
}

.stat-item p {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.result-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-primary {
  background-color: #000;
  color: white;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

/* 模态对话框样式 */
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

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
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

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin-right: 6px;
}

/* 添加通知样式 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 2000;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slide-in 0.3s ease-out;
  max-width: 80%;
}

.notification.success {
  background-color: #4caf50;
}

.notification.error {
  background-color: #f44336;
}

.close-notification {
  margin-left: 15px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.remaining-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.count-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-label {
  color: #666;
  font-weight: 500;
}

.count-value {
  font-size: 20px;
  font-weight: 600;
  color: #000;
}

.count-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.count-btn:hover {
  background-color: #f0f0f0;
}

.count-control input {
  width: 80px;
  text-align: center;
  font-size: 16px;
}

textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
}
</style> 