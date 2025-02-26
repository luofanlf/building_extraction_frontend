<template>
  <div class="extraction-container">
    <h1>建筑物提取系统</h1>
    
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
        <p>拖放遥感图像到此处，或点击上传</p>
        <button class="upload-button">选择文件</button>
      </div>
    </div>
    
    <div class="preview-section" v-if="imagePreview">
      <div class="preview-container">
        <h2>预览图像</h2>
        <img :src="imagePreview" alt="Preview" class="preview-image" />
      </div>
      
      <div class="extraction-controls">
        <h2>提取参数设置</h2>
        <div class="control-group">
          <label for="threshold">检测阈值：</label>
          <input type="range" id="threshold" min="0" max="100" v-model="threshold" />
          <span>{{ threshold }}%</span>
        </div>
        
        <div class="control-group">
          <label for="algorithm">选择算法：</label>
          <select id="algorithm" v-model="selectedAlgorithm">
            <option value="unet">U-Net</option>
            <option value="maskrcnn">Mask R-CNN</option>
            <option value="deeplab">DeepLab v3+</option>
          </select>
        </div>
        
        <button class="extract-button" @click="startExtraction">开始提取</button>
      </div>
    </div>
    
    <div class="result-section" v-if="showResults">
      <h2>提取结果</h2>
      <div class="result-image-container">
        <img src="" alt="Extraction Result" class="result-image" />
      </div>
      <div class="result-stats">
        <div class="stat-item">
          <h3>检测到的建筑物</h3>
          <p>42 个</p>
        </div>
        <div class="stat-item">
          <h3>总覆盖面积</h3>
          <p>12,450 平方米</p>
        </div>
        <div class="stat-item">
          <h3>平均建筑物面积</h3>
          <p>296.4 平方米</p>
        </div>
      </div>
      <div class="action-buttons">
        <button class="action-button">导出结果</button>
        <button class="action-button">保存项目</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BuildingExtraction',
  data() {
    return {
      imagePreview: '',
      threshold: 50,
      selectedAlgorithm: 'unet',
      showResults: false
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
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imagePreview = e.target.result
      }
      reader.readAsDataURL(file)
    },
    startExtraction() {
      // 这里应该是调用API进行实际的建筑物提取
      console.log('开始提取建筑物，使用算法:', this.selectedAlgorithm, '阈值:', this.threshold)
      
      // 模拟处理时间
      setTimeout(() => {
        this.showResults = true
      }, 2000)
    }
  }
}
</script>

<style scoped>
.extraction-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1, h2, h3 {
  color: #0d0c22;
}

h1 {
  margin-bottom: 40px;
  text-align: center;
}

.upload-section {
  margin-bottom: 40px;
}

.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #45a049;
}

.upload-icon {
  margin-bottom: 16px;
  color: #6e6d7a;
}

.upload-area p {
  color: #6e6d7a;
  margin-bottom: 16px;
}

.upload-button {
  background-color: #d8d7d7;
  color: rgb(250, 247, 247);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background-color: #45a049;
}

.preview-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.preview-image {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.extraction-controls {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  color: #6e6d7a;
}

input[type="range"], select {
  width: 100%;
  margin-bottom: 8px;
}

.extract-button {
  background-color: #45a049;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.extract-button:hover {
  background-color:#45a049;
}

.result-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.result-image {
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 24px;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #f9f8fd;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-item h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.stat-item p {
  font-size: 24px;
  font-weight: 600;
  color: #ea4c89;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-button {
  flex: 1;
  background-color: #45a049;
  ;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #45a049;
}

@media (max-width: 768px) {
  .preview-section {
    grid-template-columns: 1fr;
  }
  
  .result-stats {
    grid-template-columns: 1fr;
  }
}
</style> 