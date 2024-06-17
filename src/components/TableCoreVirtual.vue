<script lang="ts">
import type { DataItem } from "./TableUI.vue";
import type TableConfig from "@/types/TableConfig";

export interface Props {
  scrollData: DataItem[];
  scrollConfig: {
    numRowsAbove: number;
    numRowsBelow: number;
    itemSize: number;
    compact: boolean;
  };
  columnSizes: number[];
  specialColumnSizes: {
    collapserSize: number;
    selectionSize: number;
    rightSideSize: number;
  };
  currentBodyWidth: number;
  tableConfig: TableConfig;
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
import TableBodyNavigable from "./TableBodyNavigable.vue";
const props = defineProps<Props>();

const emit = defineEmits<{
  scrollerUpdate: [startIndex: number, endIndex: number];
  moveSelection: [
    horizontalMove: number,
    verticalMove: number,
    expandSelection: boolean,
  ];
  clearSelection: [];
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
  scrollToPosition: ({ top, left }: { top?: number; left?: number }) => {
    if (typeof top !== "undefined") {
      containerProps.ref.value!.scrollTop = top;
    }
    if (typeof left !== "undefined") {
      containerProps.ref.value!.scrollLeft = left;
    }
    containerProps.onScroll();
  },
  getScrollStart: () => containerProps.ref.value!.scrollTop,
  getBody,
  getContainer: () => containerProps.ref.value,
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
    <TableBodyNavigable
      @move-selection="
        (...args: [number, number, boolean]) => emit('moveSelection', ...args)
      "
      @clear-selection="emit('clearSelection')"
    >
      <template #bodyContent>
        <slot name="cell-selection-overlay" />
        <div :style="verticalStyles">
          <VirtualRow
            v-for="rowInd in vertical.toArray()"
            :key="rowInd"
            #default="{ row }"
            :row-height="scrollConfig.itemSize"
            :compact="scrollConfig.compact"
            :body-width="currentBodyWidth"
            :data-item="scrollData[rowInd - scrollConfig.numRowsAbove]"
            :column-sizes="columnSizes"
            :special-column-sizes="specialColumnSizes"
            :table-config="tableConfig"
          >
            <slot name="row" :row-ind="rowInd" :row="row" />
          </VirtualRow>
        </div>
      </template>
    </TableBodyNavigable>
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
