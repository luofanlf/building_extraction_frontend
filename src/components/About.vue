<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    
    <h3>What is Building Extraction ?</h3>
    <p>
      Building extraction aims to extract building pixels from remote sensing imagery, which plays a significant role in urban planning, dynamic urban monitoring, and many other applications.
    </p>
    <h3>About</h3>
    <p>
      This is a System based on UA-Net for Building Extraction which can be used for remote sensing image processing.
    </p>
    <h3>Author</h3>
    <p>This project is developed by <a href="https://github.com/luofanlf">Luo Fan</a></p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
p {
  font-size: 16px;
  max-width: 600px;
  text-align: center;
  line-height: 1.5;
  margin: 0 auto;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
