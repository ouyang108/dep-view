<template>
      <div class="p-4" id="pkg-deps-tree">
            <h3 class="font-medium text-neutral-800 mb-4">依赖树 (8)</h3>
            <div class="space-y-3 pl-2">
              <!-- 一级依赖 -->
              <div class="dep-item">
                <div class="flex items-center text-sm">
                  <span class="icon-wrapper mr-2 text-neutral-400 dep-toggle cursor-pointer" data-target="lodash-deps">
                    <span class="iconify" data-icon="ph:caret-right-fill" data-inline="false"></span>
                  </span>
                  <span class="font-medium">lodash</span>
                  <span class="text-neutral-500 ml-2">4.17.20</span>
                 
                </div>
                <!-- 二级依赖 (默认隐藏) -->
                <div class="hidden mt-2 pl-6" id="lodash-deps">
                  <div class="flex items-center text-sm text-neutral-700">
                    <span class="icon-wrapper mr-2 text-neutral-400">
                      <span class="iconify" data-icon="ph:minus-fill" data-inline="false"></span>
                    </span>
                    <span>@types/lodash</span>
                    <span class="text-neutral-500 ml-2">4.14.195</span>
                  </div>
                </div>
              </div>

             


            </div>
          </div>
</template>
<script setup lang="ts">
</script>
<style lang='scss' scoped>
</style>