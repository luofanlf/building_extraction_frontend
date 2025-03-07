<template>
    <div class="project-details-container">
      <div class="navigation-bar">
        <button class="nav-button" @click="$router.go(-1)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Projects
        </button>
        
        <div class="navigation-actions">
          <button class="nav-button" @click="goToHome()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </button>
          
          <button class="nav-button create-button" @click="goToExtraction()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            Create New Project
          </button>
        </div>
      </div>
  
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading project details...</p>
      </div>
  
      <div v-else-if="error" class="error-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>Error Loading Project</h3>
        <p>{{ error }}</p>
        <button class="btn" @click="fetchProjectDetails">Try Again</button>
      </div>
  
      <div v-else class="project-content">
        <div class="project-header">
          <h1>{{ project.name }}</h1>
          <div class="project-meta">
            <span class="project-date">{{ formatDate(project.created_at) }}</span>
            <span class="project-model">Model: {{ project.model }}</span>
          </div>
        </div>
  
        <div class="extraction-showcase">
          <div class="image-container input-image">
            <h3>Input Image</h3>
            <div class="image-wrapper">
              <img :src="getImageUrl(project.input_image)" alt="Input image" />
            </div>
          </div>
  
          <div class="process-arrow">
            <div class="arrow-line"></div>
            <div class="arrow-steps">
              <div class="step">
                <div class="step-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </div>
                <span>Processing</span>
              </div>
              <div class="step">
                <div class="step-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <span>Detection</span>
              </div>
              <div class="step">
                <div class="step-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
                <span>Extraction</span>
              </div>
            </div>
            <div class="arrow-head">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
  
          <div class="image-container output-image">
            <h3>Output Image</h3>
            <div class="image-wrapper">
              <img :src="getImageUrl(project.output_image)" alt="Output image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import api from '../services/api.js';
  
  export default {
    name: 'ProjectDetails',
    data() {
      return {
        isLoading: true,
        project: {},
        error: null
      };
    },
    created() {
      this.fetchProjectDetails();
    },
    methods: {
      async fetchProjectDetails() {
        try {
          this.isLoading = true;
          this.error = null;
          
          const id = this.$route.params.id;
          const response = await api.get(`/projects/${id}`);
          
          console.log('Project details response:', response);
          
          if (response && response.code === 0 && response.data) {
            this.project = response.data;
          } else if (response) {
            this.project = response;
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error('Error fetching project details:', error);
          this.error = 'Failed to load project details. Please try again.';
        } finally {
          this.isLoading = false;
        }
      },
      getImageUrl(imagePath) {
        if (!imagePath) return '';
        
        if (imagePath.startsWith('http')) {
          return imagePath;
        }
        
        if (!imagePath.startsWith('/')) {
          imagePath = '/' + imagePath;
        }
        
        const baseUrl = process.env.VUE_APP_API_URL || '';
        return baseUrl + imagePath;
      },
      formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      },
      goToHome() {
        this.$router.push('/');
      },
      goToExtraction() {
        this.$router.push('/extract');
      },
      goToProjects() {
        this.$router.push('/projects');
      }
    }
  };
  </script>
  
  <style scoped>
  .project-details-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  
  .navigation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .navigation-actions {
    display: flex;
    gap: 12px;
  }
  
  .nav-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: #000;
    font-size: 16px;
    font-weight: 500;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .nav-button:hover {
    background-color: #f0f0f0;
  }
  
  .create-button {
    background-color: #000;
    color: white;
  }
  
  .create-button:hover {
    background-color: #333;
  }
  
  .loading-container, .error-container {
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
  
  .error-container svg {
    color: #f44336;
    margin-bottom: 16px;
  }
  
  .error-container h3 {
    margin-bottom: 8px;
    font-weight: 600;
  }
  
  .error-container p {
    color: #666;
    margin-bottom: 24px;
  }
  
  .project-header {
    margin-bottom: 40px;
  }
  
  .project-header h1 {
    margin: 0 0 16px 0;
    font-size: 32px;
    font-weight: 700;
  }
  
  .project-meta {
    display: flex;
    gap: 24px;
    color: #666;
  }
  
  .extraction-showcase {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 40px;
  }
  
  .image-container {
    flex: 1;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    background-color: white;
  }
  
  .image-container h3 {
    padding: 16px 20px;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .image-wrapper {
    height: 400px;
    overflow: hidden;
  }
  
  .image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  .image-wrapper:hover img {
    transform: scale(1.03);
  }
  
  .process-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    width: 180px;
  }
  
  .arrow-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #e0e0e0;
    z-index: 1;
  }
  
  .arrow-steps {
    display: flex;
    flex-direction: column;
    gap: 30px;
    margin-bottom: 20px;
    z-index: 2;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .step-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    color: #000;
    transition: all 0.3s;
  }
  
  .step:hover .step-icon {
    background-color: #000;
    color: white;
    transform: scale(1.1);
  }
  
  .step span {
    font-size: 14px;
    font-weight: 500;
    color: #666;
  }
  
  .arrow-head {
    margin-top: 20px;
    color: #000;
    animation: pulse 1.5s infinite;
    z-index: 2;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
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
  
  /* Responsive styles */
  @media (max-width: 900px) {
    .extraction-showcase {
      flex-direction: column;
    }
    
    .process-arrow {
      width: 100%;
      flex-direction: row;
      margin: 20px 0;
    }
    
    .arrow-line {
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
    }
    
    .arrow-steps {
      flex-direction: row;
      margin-bottom: 0;
      margin-right: 20px;
      gap: 20px;
    }
    
    .arrow-head {
      margin-top: 0;
      transform: rotate(90deg);
    }
    
    .image-wrapper {
      height: 300px;
    }
  }
  
  @media (max-width: 600px) {
    .project-meta {
      flex-direction: column;
      gap: 8px;
    }
    
    .arrow-steps {
      gap: 10px;
    }
    
    .step-icon {
      width: 40px;
      height: 40px;
    }
    
    .step span {
      font-size: 12px;
    }
    
    .navigation-bar {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }
    
    .navigation-actions {
      width: 100%;
      justify-content: space-between;
    }
  }
  </style>