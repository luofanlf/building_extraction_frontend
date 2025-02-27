<template>
  <div class="about-container">
    <div class="about-content">
      <h1>{{ msg }}</h1>
      
      <div class="info-sections">
        <div class="info-section">
          <h3>What is Building Extraction?</h3>
          <p>
            Building extraction aims to extract building pixels from remote sensing imagery, which plays a significant role in urban planning, dynamic urban monitoring, and many other applications.
          </p>
        </div>
        
        <div class="info-section">
          <h3>About Us</h3>
          <p>
            This is a System based on UA-Net for Building Extraction which can be used for remote sensing image processing.
          </p>
        </div>
        
        <div class="info-section">
          <h3>Author</h3>
          <p>This project is developed by <a href="https://github.com/luofanlf">Luo Fan</a></p>
        </div>
      </div>
      
      <div class="action-buttons">
        <router-link to="/extract" class="btn">Try Building Extraction</router-link>
        <router-link to="/history" class="btn-secondary">View History</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  props: {
    msg: {
      type: String,
      default: 'Uncerscape Building Extraction System'
    }
  }
}
</script>

<style scoped>
.about-container {
  width: 100%;
  height: calc(100vh - 70px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #f9f9fb; /* Anthropic风格的浅灰背景 */
}

.about-content {
  max-width: 900px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding: 0 20px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #000;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.info-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
  justify-content: center;
  margin-bottom: 40px;
}

.info-section {
  margin-bottom: 5px;
}

h3 {
  margin: 0 0 10px;
  font-size: 1.3rem;
  color: #000;
  font-weight: 600;
}

p {
  font-size: 16px;
  line-height: 1.6;
  margin: 0 auto;
  max-width: 700px;
  color: #555;
}

a {
  color: #4361ee;
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: #000;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.btn {
  display: inline-block;
  padding: 10px 25px;
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
  padding: 10px 25px;
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

/* 响应式调整 */
@media (max-height: 600px) {
  h1 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
  
  p {
    font-size: 14px;
    line-height: 1.4;
  }
  
  .info-sections {
    gap: 10px;
    margin-bottom: 20px;
  }
}
</style>
