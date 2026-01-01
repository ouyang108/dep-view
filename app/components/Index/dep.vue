<template>
  <div class="p-4" id="pkg-deps-tree">
    <h3 class="font-medium text-neutral-800 mb-4">依赖树 ({{ deps }})</h3>
    <div class="space-y-3 pl-2 h-[680px] overflow-y-auto">
      <!-- 一级依赖 -->
      <div class="font-medium text-neutral-800 mb-2 text-xl">dependencies依赖 ({{ Object.keys(props.message.dependencies || {}).length }})</div>
      <template v-for="(item, key) in props.message.dependencies">
        <div class="dep-item ml-2">
          <div class="flex items-center text-sm">
            <span class="icon-wrapper mr-2 text-neutral-400 dep-toggle cursor-pointer" data-target="lodash-deps">
              <span class="iconify" data-icon="ph:caret-right-fill" data-inline="false"></span>
            </span>
            <span class="font-medium mr-4 w-[150px]">{{ key }}</span>
            <span class="text-neutral-500 ml-2">{{ item }}</span>

          </div>

        </div>
      </template>
      <div class="font-medium text-neutral-800 mb-2 text-xl">devDependencies依赖 ({{ Object.keys(props.message.devDependencies || {}).length }})</div>
      <template v-for="(item, key) in props.message.devDependencies">
        <div class="dep-item ml-2">
          <div class="flex items-center text-sm">
            <span class="icon-wrapper mr-2 text-neutral-400 dep-toggle cursor-pointer" data-target="lodash-deps">
              <span class="iconify" data-icon="ph:caret-right-fill" data-inline="false"></span>
            </span>
            <span class="font-medium mr-4 w-[200px]">{{ key }}</span>
            <span class="text-neutral-500 ml-2">{{ item }}</span>

          </div>

        </div>
      </template>


    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  message: {
    type: Object,
    default: () => ({})
  }
})

const deps = computed(() => Object.keys(props.message.dependencies || {}).length + Object.keys(props.message.devDependencies || {}).length)
</script>
<style lang='scss' scoped></style>