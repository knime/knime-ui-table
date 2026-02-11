<script setup lang="ts">
import { getMetaOrCtrlKey } from "@knime/utils";

import { useDataValueViews } from "./composables/useDataValueViews";
import { useStartEditingKeydown } from "./composables/useStartEditingKeydown";

const emit = defineEmits<{
  moveSelection: [
    horizontalMove: number,
    verticalMove: number,
    expandSelection: boolean,
  ];
  clearSelection: [];
  expandSelectedCell: [];
  startEditing: [initialValue?: string];
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

const { onKeydown: onStartEditingKeydown } = useStartEditingKeydown({
  onExpandAndStartEditing: (initialValue?: string) => {
    emit("expandSelectedCell");
    emit("startEditing", initialValue);
  },
  onStartEditing: (initialValue?: string) => {
    emit("startEditing", initialValue);
  },
});

const onKeyDown = (event: KeyboardEvent) => {
  if (!event[getMetaOrCtrlKey()] && event.key.includes("Arrow")) {
    onArrowKeyDown(event);
  } else if (event.key === "Tab") {
    onTab(event);
  } else if (event.key === "Escape") {
    onEscape(event);
  } else {
    onStartEditingKeydown(event);
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
    <slot name="belowBody" />
  </tbody>
</template>

<style scoped lang="postcss">
tbody {
  outline: none;
}
</style>
