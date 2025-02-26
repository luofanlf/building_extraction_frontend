<template>
  <div class="home-container">
    <h1>欢迎来到建筑物提取系统</h1>
    
    <div class="dashboard">
      <div class="info-card">
        <h2>开始新项目</h2>
        <p>上传遥感图像并开始提取建筑物。</p>
        <button class="action-button" @click="$router.push('/extract')">上传图像</button>
      </div>
      
      <div class="info-card">
        <h2>历史项目</h2>
        <p>查看您之前的建筑物提取项目。</p>
        <button class="action-button" @click="$router.push('/history')">查看历史</button>
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
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #0d0c22;
  margin-bottom: 40px;
  text-align: center;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.info-card h2 {
  color: #0d0c22;
  margin-bottom: 16px;
  font-size: 20px;
}

.info-card p {
  color: #6e6d7a;
  margin-bottom: 24px;
  line-height: 1.5;
}

.action-button {
  background-color: #45a049;
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
</style> 