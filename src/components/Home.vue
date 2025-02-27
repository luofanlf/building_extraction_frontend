<template>
  <div class="home-container">
    <div class="home-content">
      <h1>Welcome to Uncerscape</h1>
      
      <div class="dashboard">
        <div class="info-card">
          <h2>Start a new project</h2>
          <p>Upload your target image and start building extraction.</p>
          <button class="btn" @click="$router.push('/extract')">Upload</button>
        </div>
        
        <div class="info-card">
          <h2>Project History</h2>
          <p>Check your previous building extraction projects.</p>
          <button class="btn-secondary" @click="$router.push('/history')">Review</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: calc(100vh - 70px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9fb;
  padding: 40px 20px;
}

.home-content {
  max-width: 1200px;
  width: 100%;
}

h1 {
  color: #000;
  margin-bottom: 40px;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.info-card h2 {
  color: #000;
  margin-bottom: 16px;
  font-size: 22px;
  font-weight: 600;
}

.info-card p {
  color: #555;
  margin-bottom: 32px;
  line-height: 1.6;
  flex-grow: 1;
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

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}
</style> 