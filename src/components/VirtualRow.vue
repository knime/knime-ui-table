<script setup lang="ts">
import type { DataItem } from "./TableUI.vue";
defineProps<{
  dataItem?: DataItem;
  rowHeight: number;
}>();
</script>

<template>
  <template v-if="dataItem">
    <template v-if="dataItem.dots">
      <tr :style="{ height: `${rowHeight}px` }">
        <td :style="{ color: 'red' }">
          PlaceholderRow
          <!-- TODO (UIEXT-1752): Placeholder rows -->
        </td>
      </tr>
    </template>
    <slot v-else :row="dataItem.data" />
  </template>

  <tr v-else :style="{ height: `${rowHeight}px` }">
    <td :style="{ color: 'red' }">
      <!-- TODO (UIEXT-1752): Empty rows-->
      Empty row. Insert loading animation here!
    </td>
  </tr>
</template>
