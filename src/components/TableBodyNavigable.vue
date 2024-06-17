<script setup lang="ts">
import { getMetaOrCtrlKey } from "webapps-common/util/navigator";

const emit = defineEmits<{
  moveSelection: [
    horizontalMove: number,
    verticalMove: number,
    expandSelection: boolean,
  ];
  clearSelection: [];
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

const onKeyDown = (event: KeyboardEvent) => {
  if (!event[getMetaOrCtrlKey()] && event.key.includes("Arrow")) {
    onArrowKeyDown(event);
  } else if (event.key === "Tab") {
    emit("clearSelection");
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
