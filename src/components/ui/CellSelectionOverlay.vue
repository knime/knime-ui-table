<script setup lang="ts">
import { SPECIAL_COLUMNS_SIZE } from "@/util/constants";
import { computed, nextTick, ref } from "vue";
import type CellSelectionOverlayProps from "./CellSelectionOverlayProps";

const focusCellBorderOffset = 3;

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

const copied = ref(false);
const triggerCopied = () => {
  copied.value = true;
};

const virtualFocusOverlay = ref<null | HTMLDivElement>(null);
const virtualFocusOverlayCoordinates = computed(() => {
  if (!props.cellSelectionRectFocusCorner) {
    return null;
  }
  const { x: left, y: top } = props.cellSelectionRectFocusCorner;
  const right = left + 1;
  const bottom = top + 1;
  return {
    left: columnOffsets.value[left] + focusCellBorderOffset,
    right: columnOffsets.value[right] - focusCellBorderOffset,
    top:
      top * props.rowHeight +
      getRowResizeOffset.value(top) +
      focusCellBorderOffset,
    bottom:
      bottom * props.rowHeight +
      getRowResizeOffset.value(bottom) -
      focusCellBorderOffset,
  };
});

const virtualFocusOverlayHeight = computed(() => {
  return (
    virtualFocusOverlayCoordinates.value!.bottom -
    virtualFocusOverlayCoordinates.value!.top
  );
});

const virtualFocusOverlayWidth = computed(() => {
  return (
    virtualFocusOverlayCoordinates.value!.right -
    virtualFocusOverlayCoordinates.value!.left
  );
});

const isVirtualFocusOverlayInsideViewportOfBody = (
  containerBCR: DOMRect,
  focusOverlay: HTMLDivElement,
  headerHeight: number,
) => {
  const virtualFocusOverlayBCR = focusOverlay.getBoundingClientRect();
  const bodyTop = containerBCR.top + headerHeight;
  const halfHeightVirtualFocusOverlay = virtualFocusOverlayBCR.height / 2;
  const halfWidthVirtualFocusOverlay = virtualFocusOverlayBCR.width / 2;
  const focusOverlayCenterVertical =
    virtualFocusOverlayBCR.top + halfHeightVirtualFocusOverlay;
  const focusOverlayCenterHorizontal =
    virtualFocusOverlayBCR.left + halfWidthVirtualFocusOverlay;

  return {
    verticalInside:
      bodyTop <= focusOverlayCenterVertical &&
      focusOverlayCenterVertical <= containerBCR.bottom,
    horizontalInside:
      containerBCR.left <= focusOverlayCenterHorizontal &&
      focusOverlayCenterHorizontal <= containerBCR.right,
  };
};

const scrollFocusOverlayIntoView = async (
  params: null | {
    containerBCR: DOMRect | null;
    headerHeight: number;
    scrollTo: (scrollToValues: {
      top?: number;
      left?: number;
    }) => void | undefined;
  },
) => {
  // wait for focusOverlay to render at new position to calculate bounding client rect
  await nextTick();
  if (params) {
    const { containerBCR, headerHeight, scrollTo } = params;
    if (
      containerBCR &&
      virtualFocusOverlay.value &&
      virtualFocusOverlayCoordinates.value
    ) {
      const { verticalInside, horizontalInside } =
        isVirtualFocusOverlayInsideViewportOfBody(
          containerBCR,
          virtualFocusOverlay.value,
          headerHeight,
        );

      if (!verticalInside) {
        scrollTo({
          top:
            virtualFocusOverlayCoordinates.value.top -
            containerBCR.height / 2 +
            virtualFocusOverlayHeight.value,
        });
      } else if (!horizontalInside) {
        scrollTo({
          left:
            virtualFocusOverlayCoordinates.value.left -
            containerBCR.width / 2 +
            virtualFocusOverlayWidth.value / 2,
        });
      }
    }
  } else {
    virtualFocusOverlay.value?.scrollIntoView({
      block: "center",
      inline: "center",
    });
  }
};

defineExpose({
  triggerCopied,
  focus,
  scrollFocusOverlayIntoView,
});
</script>

<template>
  <div
    class="overlay"
    :class="{ copied: copied }"
    :style="{
      transform: `translateY(${top}px) translateX(${left}px)`,
      width: `${width}px`,
      height: `${height}px`,
    }"
    @animationend="copied = false"
  />
  <div
    v-if="virtualFocusOverlayCoordinates"
    ref="virtualFocusOverlay"
    class="overlay virtual-focus"
    :style="{
      transform: `translateY(${virtualFocusOverlayCoordinates.top}px) translateX(${virtualFocusOverlayCoordinates.left}px)`,
      width: `${virtualFocusOverlayWidth}px`,
      height: `${virtualFocusOverlayHeight}px`,
    }"
  />
</template>

<style lang="postcss" scoped>
.copied {
  animation: flash 0.5s;
}

@keyframes flash {
  0% {
    background-color: var(--selected-cells-background-color);
  }

  50% {
    background-color: var(--selected-cells-background-color-copied);
  }

  100% {
    background-color: var(--selected-cells-background-color);
  }
}

.overlay {
  --selected-cells-background-color: rgb(30 109 168 / 9%);
  --selected-cells-background-color-copied: rgb(30 109 168 / 30%);
  --selected-cells-border: 1px solid rgb(55 109 168);

  background-color: var(--selected-cells-background-color);
  border: var(--selected-cells-border);
  position: absolute;
  z-index: var(--z-index-cell-selection-overlay);
  pointer-events: none;

  &.virtual-focus {
    --focus-cell-border: 1px dashed rgb(44 88 135);

    border: var(--focus-cell-border);
  }
}
</style>
