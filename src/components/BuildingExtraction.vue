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
        <div class="upload-progress" v-if="isUploading">
          <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
          <span class="progress-text">Uploading... {{ uploadProgress }}%</span>
        </div>
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
        
        <button class="btn" @click="startExtraction" :disabled="isProcessing || isUploading || !imageUploaded">
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
      isUploading: false,
      uploadProgress: 0,
      imageUploaded: false,
      errorMessage: null,
      resultImage: '',
      extractionStats: {
        buildingsCount: 0,
        totalArea: 0,
        averageSize: 0
      },
      originalImage: null, // Store original image data
      uploadedImagePath: '' // Store uploaded image path
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
      // Validate file type
      if (!file.type.match('image.*')) {
        this.errorMessage = 'Please upload an image file';
        return;
      }
      
      // Validate file size (limit to 20MB)
      if (file.size > 20 * 1024 * 1024) {
        this.errorMessage = 'Image size cannot exceed 20MB';
        return;
      }
      
      // Save original image data
      this.originalImage = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      }
      reader.readAsDataURL(file);
      
      // Reset state
      this.errorMessage = null;
      this.imageUploaded = false;
      this.uploadedImagePath = '';
      
      // Automatically upload image to server
      this.uploadImage(file);
    },
    async uploadImage(file) {
      try {
        this.isUploading = true;
        this.uploadProgress = 0;
        
        // Create FormData object
        const formData = new FormData();
        formData.append('image', file);
        
        // Send POST request to upload image
        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            // Calculate and update upload progress
            this.uploadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        });
        
        // Handle response
        if (response && response.code === 0 && response.data) {
          // Save uploaded image path
          this.uploadedImagePath = response.data.imagePath;
          this.imageUploaded = true;
          console.log('Image uploaded successfully, path:', this.uploadedImagePath);
        } else {
          throw new Error(response?.message || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        this.errorMessage = error.message || 'Failed to upload image. Please try again.';
      } finally {
        this.isUploading = false;
      }
    },
    async startExtraction() {
      if (!this.imageUploaded || !this.uploadedImagePath) {
        this.errorMessage = 'Please upload an image first';
        return;
      }
      
      try {
        this.isProcessing = true;
        this.errorMessage = null;
        this.showResults = false;
        
        // Send POST request for extraction using the uploaded image path
        const response = await api.post('/extraction', {
          imagePath: this.uploadedImagePath,
          algorithm: this.selectedAlgorithm
        });
        
        // Handle response
        if (response && response.code === 0 && response.data) {
          console.log('Extraction completed, results:', response.data);
          
          // Update result image
          this.resultImage = response.data.resultImageUrl || '';
          
          // Update statistics
          this.extractionStats = {
            buildingsCount: response.data.buildingsCount || 0,
            totalArea: response.data.totalArea || 0,
            averageSize: response.data.averageSize || 0
          };
          
          // Show results section
          this.showResults = true;
        } else {
          throw new Error(response?.message || 'Failed to process extraction');
        }
      } catch (error) {
        console.error('Error during extraction:', error);
        this.errorMessage = error.message || 'An error occurred during extraction. Please try again.';
      } finally {
        this.isProcessing = false;
      }
    },
    exportResults() {
      // Export results functionality
      console.log('Exporting results');
      // Implement export functionality here
    },
    saveProject() {
      // Save project functionality
      console.log('Saving project');
      // Implement save project functionality here
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

.upload-progress {
  margin-top: 16px;
  background-color: #f0f0f0;
  border-radius: 8px;
  height: 8px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #000;
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
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