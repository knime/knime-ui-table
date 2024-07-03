<script setup>
import Row from "../src/components/layout/Row.vue";
import { provideForCloseSubMenusOnScroll } from "../src/components/composables/useCloseSubMenusOnScroll";

provideForCloseSubMenusOnScroll();
</script>

<template>
  <Row v-bind="$attrs" />
</template>
