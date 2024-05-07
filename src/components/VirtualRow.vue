<script setup lang="ts">
import type { DataItem } from "./TableUI.vue";
import PlaceholderRow from "./ui/PlaceholderRow.vue";
import EmptyRow from "./ui/EmptyRow.vue";
defineProps<{
  dataItem?: DataItem;
  rowHeight: number;
  bodyWidth: number;
}>();
</script>

<template>
  <template v-if="dataItem">
    <template v-if="dataItem.dots">
      <PlaceholderRow :height="rowHeight" />
    </template>
    <slot v-else :row="dataItem.data" />
  </template>
  <EmptyRow v-else :height="rowHeight" :width="bodyWidth" />
</template>
