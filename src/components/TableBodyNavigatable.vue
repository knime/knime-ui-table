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
  startEditing: [initialValue?: string];
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

const onEscape = (event: KeyboardEvent) => {
  if (selectedCellIsExpanded.value) {
    event.preventDefault();
    event.stopPropagation();
    closeExpandedSelectedCell();
  }
};

const onTab = (event: KeyboardEvent) => {
  event.preventDefault();
  event.stopPropagation();
  const horizontalMove = event.shiftKey ? -1 : 1;
  emit("moveSelection", horizontalMove, 0, false);
};

const onEnter = (event: KeyboardEvent) => {
  if (!event.shiftKey) {
    event.preventDefault();
    event.stopPropagation();
    emit("expandSelectedCell");
    emit("startEditing");
  }
};

const onSpace = (event: KeyboardEvent) => {
  event.preventDefault();
  emit("expandSelectedCell");
  emit("startEditing", " ");
};

const onKeyDown = (event: KeyboardEvent) => {
  if (!event[getMetaOrCtrlKey()] && event.key.includes("Arrow")) {
    onArrowKeyDown(event);
  } else if (event.key === "Tab") {
    onTab(event);
  } else if (event.key === "Enter") {
    onEnter(event);
  } else if (event.key === " ") {
    onSpace(event);
  } else if (event.key === "Escape") {
    onEscape(event);
  } else if (
    !event[getMetaOrCtrlKey()] &&
    !event.altKey &&
    event.key.length === 1
  ) {
    // Handle any printable character to start editing with that character
    event.preventDefault();
    emit("startEditing", event.key);
  }
};
</script>

<template>
  <tbody tabindex="-1" @keydown.self="onKeyDown">
    <slot name="bodyContent" />
    <slot name="belowBody" />
  </tbody>
</template>

<style scoped lang="postcss">
tbody {
  outline: none;
}
</style>
