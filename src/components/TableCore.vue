<script setup lang="ts">
import { computed, ref, toRef } from "vue";

import "../assets/main.css";
import type { MenuItem } from "@knime/components";

import type TableConfig from "@/types/TableConfig";
import { SPECIAL_COLUMNS_SIZE } from "@/util/constants";

import TableCoreGroups from "./TableCoreGroups.vue";
import TableCoreVirtual from "./TableCoreVirtual.vue";
import type { DataItem } from "./TableUI.vue";
import { useAvailableWidth } from "./composables/useAvailableWidth";
import { provideCommonScrollContainerProps } from "./composables/useCommonScrollContainerProps";

const props = defineProps<{
  scrollData: DataItem[][];
  scrollConfig: {
    itemSize: number;
    numRowsAbove: number;
    numRowsBelow: number;
    compact: boolean;
  };
  tableConfig: TableConfig;
  totalWidth: null | number;
  columnSizes: number[];
  currentRowHeight: number | "dynamic";
  columnResize: {
    active: boolean;
  };
  currentRectId: any;
}>();

const emit = defineEmits<{
  scrollerUpdate: [startIndex: number, endIndex: number];
  groupSubMenuClick: [item: MenuItem, dataGroup: any[]];
  "update:available-width": [newAvailableWidth: number];
  moveSelection: [
    horizontalMove: number,
    verticalMove: number,
    expandSelection: boolean,
  ];
  clearSelection: [];
  bodyFocusin: [];
  bodyFocusout: [];
}>();

const tableCoreVirtual = ref<InstanceType<typeof TableCoreVirtual> | null>(
  null,
);

/**
 * We expose some internals of the virtual scroller for enabling keeping the.
 */
defineExpose({
  virtualScrollToPosition: (position: { top?: number; left?: number }) =>
    tableCoreVirtual.value?.scrollToPosition(position),
  getVirtualScrollStart: () => tableCoreVirtual.value?.getScrollStart(),
  getVirtualBody: () => tableCoreVirtual.value?.getBody(),
  getVirtualContainer: () => tableCoreVirtual.value?.getContainer(),
});

const collapserSize = computed(() =>
  props.tableConfig.showCollapser ? SPECIAL_COLUMNS_SIZE : 0,
);
const selectionSize = computed(() =>
  props.tableConfig.showSelection ? SPECIAL_COLUMNS_SIZE : 0,
);

const rightSideSize = computed(() => {
  return props.tableConfig.showColumnFilters ||
    (props.tableConfig.subMenuItems ?? []).length > 0 ||
    props.tableConfig.reserveSpaceForSubMenu === "always"
    ? SPECIAL_COLUMNS_SIZE
    : 0;
});

const scrolledElement = ref<HTMLElement | null>(null);
const { fitsInsideTotalWidth, innerWidthToBodyWidth } = useAvailableWidth({
  emitAvailableWidth: (newWidth) => emit("update:available-width", newWidth),
  specialColumnsSizeTotal: computed(
    () => collapserSize.value + selectionSize.value + rightSideSize.value,
  ),
  refs: { scrolledElement },
  totalWidth: toRef(props, "totalWidth"),
});

const currentBodyWidth = computed(() => {
  const widthContentColumns = props.columnSizes.reduce(
    (prev: any, curr: any) => prev + curr,
    0,
  );
  return innerWidthToBodyWidth(widthContentColumns);
});
const fitsWithoutHorizontalScrollbar = computed(() =>
  fitsInsideTotalWidth(currentBodyWidth.value),
);

provideCommonScrollContainerProps(scrolledElement, {
  fitsWithoutHorizontalScrollbar,
  columnResizeActive: computed(() => props.columnResize.active),
});
</script>

<template>
  <TableCoreVirtual
    v-if="
      props.tableConfig.enableVirtualScrolling && props.scrollData.length === 1
    "
    ref="tableCoreVirtual"
    :scroll-data="scrollData[0]"
    :column-sizes="columnSizes"
    :scroll-config="scrollConfig"
    :special-column-sizes="{
      collapserSize,
      selectionSize,
      rightSideSize,
    }"
    :current-body-width="currentBodyWidth"
    :table-config="tableConfig"
    @scroller-update="
      (startIndex, endIndex) => emit('scrollerUpdate', startIndex, endIndex)
    "
    @move-selection="
      (...args: [number, number, boolean]) => emit('moveSelection', ...args)
    "
    @clear-selection="emit('clearSelection')"
    @body-focusin="emit('bodyFocusin')"
    @body-focusout="emit('bodyFocusout')"
  >
    <template #header="{ getDragHandleHeight }">
      <slot
        name="header"
        :get-drag-handle-height="getDragHandleHeight"
        :width="currentBodyWidth"
      />
    </template>
    <template #row="{ row, rowInd }">
      <slot name="row" :row="row" :row-ind="rowInd" :is-top="true" />
    </template>
    <template #cell-selection-overlay>
      <slot name="cell-selection-overlay" />
    </template>
  </TableCoreVirtual>

  <TableCoreGroups
    v-else
    ref="tableCoreVirtual"
    :scroll-data="scrollData"
    :current-body-width="currentBodyWidth"
    :current-rect-id="currentRectId"
    :table-config="tableConfig"
    @group-sub-menu-click="
      (item, dataGroup) => emit('groupSubMenuClick', item, dataGroup)
    "
    @move-selection="
      (...args: [number, number, boolean]) => emit('moveSelection', ...args)
    "
    @clear-selection="emit('clearSelection')"
    @body-focusin="emit('bodyFocusin')"
    @body-focusout="emit('bodyFocusout')"
  >
    <template #header="{ getDragHandleHeight }">
      <slot
        name="header"
        :width="currentBodyWidth"
        :get-drag-handle-height="getDragHandleHeight"
      />
    </template>
    <template #cell-selection-overlay="{ groupInd }">
      <slot name="cell-selection-overlay" :group-ind="groupInd" />
    </template>
    <template #row="{ row, rowInd, groupInd }">
      <slot name="row" :row="row" :row-ind="rowInd" :group-ind="groupInd" />
    </template>
  </TableCoreGroups>
</template>

<style scoped lang="postcss">
/**
 * TODO: Remove if no longer necessary. Move otherwise
 */
:deep(tbody) {
  display: block;
  min-height: 0;
  flex-shrink: 0;
}

/**
 * TODO: Remove if no longer necessary. Move otherwise
 */
:deep(td > a) {
  text-decoration: none;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
  padding-right: 15px;
}

/**
 * TODO: Remove if no longer necessary. Move otherwise
 */
:deep(td:first-child > a) {
  padding-left: 15px;
}
</style>
