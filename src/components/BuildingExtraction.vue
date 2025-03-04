<template>
  <div class="extraction-container">
    <h1>Building Extraction</h1>
    
    <div class="upload-section">
      <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
        <input type="file" ref="fileInput" @change="handleFileSelected" accept="image/*" style="display: none" />
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
        
        <button class="btn" @click="startExtraction" :disabled="isProcessing || !originalImage">
          {{ isProcessing ? 'Processing...' : 'Start Extraction' }}
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
      <div class="action-buttons">
        <button class="btn" @click="exportResults">Export Results</button>
        <button class="btn-secondary" @click="saveProject">Save Project</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js';

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
      originalImage: null
    }
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
    processImage(file) {
      // 验证文件类型
      if (!file.type.match('image.*')) {
        this.errorMessage = 'Please upload an image file';
        return;
      }
      
      // 验证文件大小 (限制为20MB)
      if (file.size > 20 * 1024 * 1024) {
        this.errorMessage = 'Image size cannot exceed 20MB';
        return;
      }
      
      // 存储原始图片数据，待发送
      this.originalImage = file;
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      }
      reader.readAsDataURL(file);
      
      // 重置状态
      this.errorMessage = null;
      this.showResults = false;
    },
    async startExtraction() {
      if (!this.originalImage) {
        this.errorMessage = 'Please select an image first';
        return;
      }
      
      try {
        console.log('开始提取过程...');
        this.isProcessing = true;
        this.errorMessage = null;
        this.showResults = false;
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append('image', this.originalImage);
        formData.append('algorithm', this.selectedAlgorithm);
        
        console.log('准备发送提取请求，算法:', this.selectedAlgorithm);
        
        // 发送请求，一步完成上传和提取
        const response = await api.post('/extraction', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('原始响应:', response);
        
        // 解析返回数据 - 根据响应格式确定正确路径
        let resultUrl = '';
        
        // 检查response.data的类型和内容
        if (typeof response.data === 'string') {
          // 直接是字符串URL
          resultUrl = response.data;
          console.log('响应是字符串URL:', resultUrl);
        } else if (response.data && response.data.data) {
          // 包含在data.data中
          resultUrl = response.data.data;
          console.log('响应包含在data.data中:', resultUrl);
        } else if (response.data && response.data.code === 0) {
          // 标准响应格式
          resultUrl = response.data.data;
          console.log('标准响应格式,URL在data.data中:', resultUrl);
        } else {
          console.error('未识别的响应格式:', response.data);
          throw new Error('Unrecognized response format');
        }
        
        // 设置结果图像URL - 确保URL是完整的
        if (resultUrl) {
          // 处理相对URL，确保完整路径
          if (resultUrl.startsWith('/')) {
            // 使用后端服务器URL - 直接指定，不使用import.meta.env
            const backendUrl = process.env.VUE_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';
            this.resultImage = `${backendUrl}${resultUrl}`;
            console.log('转换为完整URL:', this.resultImage);
          } else if (resultUrl.startsWith('http')) {
            // 已经是完整URL
            this.resultImage = resultUrl;
          } else {
            // 其他情况，添加默认前缀
            const backendUrl = process.env.VUE_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';
            this.resultImage = `${backendUrl}/${resultUrl}`;
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
        } else {
          throw new Error('No result image URL found in response');
        }
      } catch (error) {
        console.error('提取过程中的错误:', error);
        console.error('错误详情:', error.stack);
        this.errorMessage = error.message || 'An error occurred during extraction. Please try again.';
      } finally {
        this.isProcessing = false;
        console.log('提取过程结束');
      }
    },
    exportResults() {
      // 导出结果功能
      console.log('Exporting results');
      // 实现导出功能
    },
    saveProject() {
      // 保存项目功能
      console.log('Saving project');
      // 实现保存项目功能
    }
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
  display: inline-block;
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
}

.btn:hover {
  background-color: #333;
  transform: translateY(-1px);
}

.btn:disabled {
  background-color: #999;
  cursor: not-allowed;
  transform: none;
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

.action-buttons {
  display: flex;
  gap: 16px;
}

@media (max-width: 768px) {
  .preview-section {
    grid-template-columns: 1fr;
  }
  
  .result-stats {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 