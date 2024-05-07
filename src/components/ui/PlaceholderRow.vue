<script setup lang="ts">
defineProps<{ height: number }>();
const fontSize = 25;
</script>

<template>
  <div class="dots" :style="{ height: `${height}px` }">
    <span :style="{ fontSize: `${fontSize}px` }"> &vellip; </span>
  </div>
</template>

<style lang="postcss" scoped>
.dots {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  & span {
    text-align: center;
    pointer-events: none;
  }
}
</style>
