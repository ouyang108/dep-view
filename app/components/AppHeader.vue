<template>
    <header class="bg-white shadow-sm px-6 py-4 sticky top-0 z-10">
        <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold text-neutral-800 flex items-center">
                包依赖管理工具
            </h1>
            <div class="flex items-center space-x-4">
                <!-- 切换视图按钮 -->
                <div class="flex border border-neutral-200 rounded-lg overflow-hidden">
                    <!-- px-4 py-2   transition-colors flex items-center-->
                    <button id="show-list-btn"
                        :class="[currentView === 'list' ? 'bg-primary text-white hover:bg-primary/90' : '', 'px-4 py-2  transition-colors flex items-center']"
                        @click="show('list')">
                        包列表
                    </button>
                    <button id="show-graph-btn"
                        :class="[currentView === 'dependencyGraph' ? 'bg-primary text-white hover:bg-primary/90' : '', 'px-4 py-2  transition-colors flex items-center']"
                        @click="show('dependencyGraph')">
                        依赖图
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const currentView = ref('list')
const show = (view: string) => {
    // 切换到依赖图视图
    if (currentView.value === view) {
        return
    }
    currentView.value = view
    if (view === 'list') {
        router.push('/')
    } else {
        router.push(view)
    }

}
</script>
<style lang='scss' scoped></style>