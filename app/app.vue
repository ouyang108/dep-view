<template>
  <div>
   123456
  </div>
</template>
<script lang="ts" setup>
  console.log(4444444)
  // 发送请求
  onMounted(()=> {
    console.log(123)
    // 访问
    fetch('/message').then(res => res.json()).then(data => {
      console.log(data)
    })
     
  })
</script>
