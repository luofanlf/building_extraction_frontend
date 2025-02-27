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
          <label for="threshold">Detection Threshold:</label>
          <input type="range" id="threshold" min="0" max="100" v-model="threshold" />
          <span>{{ threshold }}%</span>
        </div>
        
        <div class="control-group">
          <label for="algorithm">Algorithm Selection:</label>
          <select id="algorithm" v-model="selectedAlgorithm">
            <option value="unet">U-Net</option>
            <option value="maskrcnn">Mask R-CNN</option>
            <option value="deeplab">DeepLab v3+</option>
          </select>
        </div>
        
        <button class="btn" @click="startExtraction">Start Extraction</button>
      </div>
    </div>
    
    <div class="result-section" v-if="showResults">
      <h2>Extraction Results</h2>
      <div class="result-image-container">
        <img src="" alt="Extraction Result" class="result-image" />
      </div>
      <div class="result-stats">
        <div class="stat-item">
          <h3>Buildings Detected</h3>
          <p>42</p>
        </div>
        <div class="stat-item">
          <h3>Total Area</h3>
          <p>12,450 m²</p>
        </div>
        <div class="stat-item">
          <h3>Average Building Size</h3>
          <p>296.4 m²</p>
        </div>
      </div>
      <div class="action-buttons">
        <button class="btn">Export Results</button>
        <button class="btn-secondary">Save Project</button>
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
  margin-bottom: 24px;
}

.control-group label {
  display: block;
  margin-bottom: 10px;
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

input[type="range"], select {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px 0;
}

select {
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  color: #000;
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