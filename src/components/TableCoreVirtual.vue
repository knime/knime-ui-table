<script lang="ts">
import type { DataItem } from "./TableUI.vue";
export interface Props {
  scrollData: DataItem[];
  scrollConfig: {
    numRowsAbove: number;
    numRowsBelow: number;
    itemSize: number;
  };
  columnSizes: number[];
  specialColumnSizes: {
    collapserSize: number;
    selectionSize: number;
    rightSideSize: number;
  };
  currentBodyWidth: number;
}
</script>

<script setup lang="ts">
import { computed, ref, toRef, type Ref, watch } from "vue";
import "../assets/main.css";

import {
  useVirtualGrid,
  SameSizeManager,
  ArraySizeManager,
  WithSpaceBefore,
  WithSpaceAfter,
  type SizeManager,
} from "@knime/vue-headless-virtual-scroller";

import VirtualRow from "./VirtualRow.vue";
import { provideForHorizontalVirtualScrolling } from "./composables/useHorizontalIndicesAndStyles";
import { useCommonScrollContainerProps } from "./composables/useCommonScrollContainerProps";
const props = defineProps<Props>();

const emit = defineEmits<{
  scrollerUpdate: [startIndex: number, endIndex: number];
}>();

const withLeftSideSize = (sizeManager: SizeManager) =>
  new WithSpaceBefore(
    {
      spaceBefore: computed(
        () =>
          props.specialColumnSizes.collapserSize +
          props.specialColumnSizes.selectionSize,
      ),
      spaceBeforeIsOffset: false,
    },
    sizeManager,
  );
const withRightSideSize = (sizeManager: SizeManager) =>
  new WithSpaceAfter(
    computed(() => props.specialColumnSizes.rightSideSize),
    sizeManager,
  );

const columnSizeManager = withLeftSideSize(
  withRightSideSize(new ArraySizeManager(toRef(props, "columnSizes"))),
);

const numRows: Ref<number> = computed(
  () =>
    props.scrollData.length +
    props.scrollConfig.numRowsAbove +
    props.scrollConfig.numRowsBelow,
);
const rowHeight = computed(() => props.scrollConfig.itemSize);
const rowSizeManager = new SameSizeManager(numRows, rowHeight);

const {
  containerProps,
  indices: { vertical, horizontal },
  scrolledAreaStyles: {
    vertical: verticalStyles,
    horizontal: horizontalStyles,
  },
} = useVirtualGrid({
  rows: { sizeManager: rowSizeManager },
  columns: { sizeManager: columnSizeManager },
});

watch(
  () => vertical.value,
  ({ endIndex, startIndex }) => {
    if (Number.isNaN(endIndex) || Number.isNaN(startIndex)) {
      return;
    }
    emit("scrollerUpdate", startIndex, endIndex);
  },
  { immediate: true },
);

provideForHorizontalVirtualScrolling({
  horizontal,
  horizontalStyles,
});

// DRAG HANDLE

const headerContainer: Ref<null | HTMLElement> = ref(null);
const getHeaderHeight = () => {
  return headerContainer.value?.offsetHeight ?? 0;
};

const getBody = () => containerProps.ref.value?.querySelector("tbody");

const getDragHandleHeight = () => {
  const scrollContainer = containerProps.ref.value;
  if (scrollContainer === null) {
    return 0;
  }
  const headerHeight = getHeaderHeight();
  /**
   * If the second argument is the smaller one, this means that the scroller is
   * not scrollable at the moment, i.e. adding the header height to the body height
   * is the desired height, as they cannot overlap.
   */
  return Math.min(
    scrollContainer.offsetHeight,
    Math.floor(getBody()!.offsetHeight + headerHeight),
  );
};

const {
  closeExpandedSubMenu,
  containerRef: injectedContainerRef,
  overflowStyles,
} = useCommonScrollContainerProps();

/**
 * We expose some internals of the virtual scroller for enabling keeping the.
 */
defineExpose({
  scrollToPosition: (scrollPosition: number) => {
    containerProps.ref.value!.scrollTop = scrollPosition;
    containerProps.onScroll();
  },
  getScrollStart: () => containerProps.ref.value!.scrollTop,
  getBody,
});
</script>

<template>
  <div
    v-if="containerProps"
    :ref="
      (element) => {
        containerProps.ref.value = injectedContainerRef =
          element as HTMLElement | null;
      }
    "
    :style="overflowStyles"
    class="container"
    @scroll="() => [containerProps.onScroll(), closeExpandedSubMenu()]"
  >
    <div ref="headerContainer" class="header-container">
      <slot name="header" :get-drag-handle-height="getDragHandleHeight" />
    </div>
    <tbody>
      <slot name="cell-selection-overlay" />
      <div :style="verticalStyles">
        <VirtualRow
          v-for="rowInd in vertical.toArray()"
          :key="rowInd"
          #default="{ row }"
          :row-height="scrollConfig.itemSize"
          :body-width="currentBodyWidth"
          :data-item="scrollData[rowInd - scrollConfig.numRowsAbove]"
        >
          <slot name="row" :row-ind="rowInd" :row="row" />
        </VirtualRow>
      </div>
    </tbody>
  </div>
</template>

<style scoped lang="postcss">
.container {
  flex: 1 1 0;

  & .header-container {
    z-index: var(--z-index-sticky-header);
    top: 0;
    position: sticky;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  & tbody {
    /**
      * Otherwise there is a small margin from the left that leads to an unnecessary scrollbar
    */
    display: block;

    /**
      * Necessary for the absolutely placed elements inside of it (e.g. cell selection overlay)
      * to scroll with the body.
    */
    position: relative;

    /**
     * Necessary so that non-virtual elements (like drag handles) are wide enough
    */
    width: fit-content;
  }
}
</style>
