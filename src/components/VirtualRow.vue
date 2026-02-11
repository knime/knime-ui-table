<script setup lang="ts">
import type TableConfig from "@/types/TableConfig";

import type { DataItem } from "./TableUI.vue";
import EmptyRow from "./ui/EmptyRow.vue";
import PlaceholderRow from "./ui/PlaceholderRow.vue";

defineProps<{
  dataItem?: DataItem;
  rowHeight: number;
  compact: boolean;
  bodyWidth: number;
  columnSizes: number[];
  specialColumnSizes: {
    collapserSize: number;
    selectionSize: number;
    deletionSize: number;
    rightSideSize: number;
  };
  tableConfig: TableConfig;
}>();
</script>

<template>
  <template v-if="dataItem">
    <template v-if="dataItem.dots">
      <PlaceholderRow :height="rowHeight" />
    </template>
    <slot v-else :row="dataItem.data" />
  </template>
  <EmptyRow
    v-else
    :height="rowHeight"
    :compact="compact"
    :width="bodyWidth"
    :column-sizes="columnSizes"
    :special-column-sizes="specialColumnSizes"
    :table-config="tableConfig"
  />
</template>
