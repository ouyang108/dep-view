<template>
    <div class="header p-4">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section class="lg:col-span-4 space-y-6 bg-white rounded-xl h-[800px] overflow-y-auto ">
                <div class="">
                    <!-- 包项 1 (element-plus) -->
                    <div :class="[index === currentIndex ? 'pkg-active' : '', 'p-4 border-b border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors pkg-item']"
                        data-pkg="element-plus" v-for="item, index in list" :key="index" @click="change(index)">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center">
                               
                                <h3 class="font-medium text-neutral-800">{{ item.name }}</h3>
                            </div>
                            <!-- <span class="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">有更新</span> -->
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span class="text-neutral-500">当前版本:</span>
                                <span class="font-medium ml-1">{{ item.currentVersion }}</span>
                            </div>
                            <div>
                                <span class="text-neutral-500">最新版本:</span>
                                <span class="font-medium ml-1 text-primary">{{ item.latestVersion }}</span>
                            </div>
                        </div>
                        <!-- GitHub 链接 -->
                        <div class="mt-2">
                            <span class="text-neutral-500">GitHub:</span>
                            <a  target="_blank" class="font-medium ml-1 text-primary">{{ item.githubUrl }}</a>
                        </div>
                    </div>
                </div>
            </section>
            <!-- 右侧详情 -->
            <section class="lg:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="p-4 border-b border-neutral-200">
                    <h2 class="font-semibold text-neutral-800" id="pkg-detail-title">{{ list[currentIndex]?.name || ''
                    }} 依赖详情</h2>
                </div>
                <!-- 包基本信息 -->
                <div class="p-4 border-b border-neutral-200" id="pkg-basic-info">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h3 class="text-sm text-neutral-500 mb-1">包名称</h3>
                            <p class="font-medium text-lg">{{ list[currentIndex]?.name || '' }}</p>
                        </div>
                        <div>
                            <h3 class="text-sm text-neutral-500 mb-1">当前版本</h3>
                            <p class="font-medium">{{ list[currentIndex]?.currentVersion || '' }}</p>
                        </div>
                        <div>
                            <h3 class="text-sm text-neutral-500 mb-1">最新版本</h3>
                            <p class="font-medium text-primary">{{ list[currentIndex]?.latestVersion || '' }}</p>
                        </div>
                    </div>
                </div>
                <!-- 依赖树 -->
                <IndexDep :message="list[currentIndex]"></IndexDep>
                <!-- 更新内容 如果是最新的就不显示-->
                <!-- <IndexUpdate></IndexUpdate> -->
            </section>

        </div>
    </div>
</template>
<script setup lang="ts">
//    { currentVersion:'^1.0.1',githubUrl:'git@gitlab.alibaba-inc.com:amap-web/amap-jsapi-loader.git'
// ,latestVersion:'1.0.1',name:'@amap/amap-jsapi-loader'}
// 调用接口获取数据
const list = ref<any[]>([])
const currentIndex = ref(0)
const change = (index: number) => {
    currentIndex.value = index
}
onMounted(async () => {
    const data :{message:any[]}= await $fetch('http://localhost:3000/message')
    if(data.message) {
      
        list.value = data?.message || []
    }

})
</script>
<style lang='scss' scoped></style>
