<template>
  
    <div class="w-full h-full">
      <AppHeader />
      <NuxtPage />
    </div>
</template>
<script lang="ts" setup>
  // 在组件挂载后执行API调用，避免静态构建时的顶层await问题
  onMounted(async () => {
    const data = await $fetch('http://localhost:3000/message')
//     // 0
// : 
// currentVersion
// : 
// "^1.0.1"
// githubUrl
// : 
// "git@gitlab.alibaba-inc.com:amap-web/amap-jsapi-loader.git"
// latestVersion
// : 
// "1.0.1"
// name
// : 
// "@amap/amap-jsapi-loader"
    // console.log(data.message)
  })
</script>
