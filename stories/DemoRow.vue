<script setup>
import Row from "../src/components/layout/Row.vue";
import { provideForCloseSubMenusOnScroll } from "../src/components/composables/useCloseSubMenusOnScroll";
import { provideDataValueViewsIsShown } from "../src/components/composables/useDataValueViews";
import { ref } from "vue";
provideForCloseSubMenusOnScroll();
provideDataValueViewsIsShown(ref({}), null);
</script>

<template>
  <Row v-bind="$attrs" />
</template>
