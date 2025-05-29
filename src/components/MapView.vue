<template>
  <div class="map-container">
    <div class="map-header">
      <h1>Map View</h1>
    </div>
    <div class="map-content">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d31909.864881511883!2d103.7636757!3d1.33637345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1szh-CN!2ssg!4v1748416052027!5m2!1szh-CN!2ssg&maptype=satellite" 
        width="100%" 
        height="600" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapView'
}
</script>

<style scoped>
.map-container {
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 40px 20px;
  background-color: #f9f9fb;
}

.map-header {
  max-width: 1200px;
  margin: 0 auto 30px;
}

.map-header h1 {
  color: #000;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-align: center;
}

.map-content {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
</style> 