<script setup lang="ts">
import { getMetaOrCtrlKey } from "@knime/utils";

import { useDataValueViews } from "./composables/useDataValueViews";

const emit = defineEmits<{
  moveSelection: [
    horizontalMove: number,
    verticalMove: number,
    expandSelection: boolean,
  ];
  clearSelection: [];
  expandSelectedCell: [];
  bodyFocusin: [];
  bodyFocusout: [];
}>();

const onArrowKeyDown = (event: KeyboardEvent) => {
  let horizontal = 0;
  let vertical = 0;
  switch (event.key) {
    case "ArrowLeft":
      horizontal = -1;
      break;
    case "ArrowRight":
      horizontal = 1;
      break;
    case "ArrowUp":
      vertical = -1;
      break;
    case "ArrowDown":
      vertical = 1;
      break;
  }
  if (horizontal || vertical) {
    event.preventDefault();
    emit("moveSelection", horizontal, vertical, event.shiftKey);
  }
};

const { isShown: selectedCellIsExpanded, close: closeExpandedSelectedCell } =
  useDataValueViews();

const onKeyDown = (event: KeyboardEvent) => {
  if (!event[getMetaOrCtrlKey()] && event.key.includes("Arrow")) {
    onArrowKeyDown(event);
  } else if (event.key === "Tab") {
    emit("clearSelection");
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    emit("expandSelectedCell");
  } else if (event.key === "Escape" && selectedCellIsExpanded.value) {
    event.preventDefault();
    event.stopPropagation();
    closeExpandedSelectedCell();
  }
};
</script>

<template>
  <tbody
    :tabindex="-1"
    @keydown.self="onKeyDown"
    @focusin="emit('bodyFocusin')"
    @focusout="emit('bodyFocusout')"
  >
    <slot name="bodyContent" />
  </tbody>
</template>

<style scoped lang="postcss">
tbody {
  outline: none;
}
</style>
