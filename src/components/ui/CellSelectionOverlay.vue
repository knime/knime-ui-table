<script setup lang="ts">
import { SPECIAL_COLUMNS_SIZE } from "@/util/constants";
import { computed } from "vue";
import type CellSelectionOverlayProps from "./CellSelectionOverlayProps";

const props = defineProps<CellSelectionOverlayProps>();

const getRowResizeOffset = computed(() => {
  const rowResizeIndex = props.rowResizeIndex;
  const rowResizeDelta = props.rowResizeDelta;
  if (rowResizeIndex === null || rowResizeDelta === null) {
    return () => 0;
  } else {
    return (index: number) => (index > rowResizeIndex ? rowResizeDelta : 0);
  }
});

const top = computed(() => {
  const { min } = props.rect.y;
  return min * props.rowHeight + getRowResizeOffset.value(min);
});

const bottom = computed(() => {
  const { max } = props.rect.y;
  return (max + 1) * props.rowHeight + getRowResizeOffset.value(max + 1);
});

const columnOffsets = computed(() => {
  let currentOffset = 0;
  if (props.tableConfig.showSelection) {
    currentOffset += SPECIAL_COLUMNS_SIZE;
  }
  if (props.tableConfig.showCollapser) {
    currentOffset += SPECIAL_COLUMNS_SIZE;
  }
  const offsets: number[] = [];
  props.columnSizes.forEach((size) => {
    offsets.push(currentOffset);
    currentOffset += size;
  });
  offsets.push(currentOffset);
  return offsets;
});

const left = computed(() => {
  const { min } = props.rect.x;
  return columnOffsets.value[min];
});

const right = computed(() => {
  const { max } = props.rect.x;
  return columnOffsets.value[max + 1];
});

const height = computed(() => {
  return bottom.value - top.value;
});

const width = computed(() => {
  return right.value - left.value;
});
</script>

<template>
  <div
    class="overlay"
    :style="{
      transform: `translateY(${top}px) translateX(${left}px)`,
      width: `${width}px`,
      height: `${height}px`,
    }"
  />
</template>

<style lang="postcss" scoped>
.overlay {
  --selected-cells-background-color: rgb(30 109 168 / 9%);
  --selected-cells-border: 1px solid rgb(55 109 168);

  background-color: var(--selected-cells-background-color);
  border: var(--selected-cells-border);
  position: absolute;
  z-index: 1;
  pointer-events: none;
}
</style>
