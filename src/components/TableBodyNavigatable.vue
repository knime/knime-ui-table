<script setup lang="ts">
import { navigatorUtils } from "@knime/utils";
import useDataValueViewsIsShown from "./composables/useDataValueViewsIsShown";

const emit = defineEmits<{
  moveSelection: [
    horizontalMove: number,
    verticalMove: number,
    expandSelection: boolean,
  ];
  clearSelection: [];
  expandSelectedCell: [];
  closeExpandedSelectedCell: [];
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

const dataValueViewIsShown = useDataValueViewsIsShown();

const onKeyDown = (event: KeyboardEvent) => {
  if (
    !event[navigatorUtils.getMetaOrCtrlKey()] &&
    event.key.includes("Arrow")
  ) {
    onArrowKeyDown(event);
  } else if (event.key === "Tab") {
    emit("clearSelection");
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    emit("expandSelectedCell");
  } else if (event.key === "Escape" && dataValueViewIsShown?.value) {
    event.preventDefault();
    event.stopPropagation();
    emit("closeExpandedSelectedCell");
  }
};
</script>

<template>
  <tbody tabindex="-1" @keydown.self="onKeyDown">
    <slot name="bodyContent" />
  </tbody>
</template>

<style scoped lang="postcss">
tbody {
  outline: none;
}
</style>
