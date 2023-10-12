<script setup lang="ts">
import { computed, ref, toRef, toRefs, type Ref } from "vue";
import useCloseSubMenusOnScroll from "./composables/useCloseSubMenusOnScroll";
import "./global-z-indices.css";

import PlaceholderRow from "./ui/PlaceholderRow.vue";
import Group from "./layout/Group.vue";
import useAvailableWidth from "./composables/useAvailableWidth";
import { SPECIAL_COLUMNS_SIZE } from "@/util/constants";

import { RecycleScroller as RC } from "vue-virtual-scroller";
const RecycleScroller = RC as any;

const props = defineProps<{
  scrollData: any[][];
  recycleScrollerConfig: {
    scrollerItemSize: number;
    numRowsAbove: number;
    numRowsBelow: number;
  };
  tableConfig: any;
  totalWidth: null | number;
  columnSizes: number[];
  columnResize: {
    active: boolean;
  };
  rowResize:
    | {
        active: true;
        currentResizedScrollIndex: number;
        currentRowSizeDelta: number;
      }
    | { active: false };
  currentRectId: any;
}>();

const emit = defineEmits([
  "scroller-update",
  "group-sub-menu-click",
  "update:available-width",
]);

const showVirtualScroller = computed(() =>
  Boolean(
    props.tableConfig.enableVirtualScrolling && props.scrollData.length === 1,
  ),
);

const { closeExpandedSubMenu, registerExpandedSubMenu } =
  useCloseSubMenusOnScroll();

const getGroupName = (ind: number) => {
  return props.tableConfig.groupByConfig?.currentGroupValues?.[ind] || "";
};

const virtualScroller: Ref<{
  scrollToPosition: (pos: number) => void;
  getScroll: () => { start: number };
  $refs: { wrapper: HTMLElement };
  $el: HTMLElement;
} | null> = ref(null);

const nonVirtualScroller: Ref<any> = ref(null);

const enableVirtualScrolling = computed(
  () => props.tableConfig.enableVirtualScrolling,
);
const scrolledElement = computed(() => {
  if (enableVirtualScrolling.value) {
    return virtualScroller.value === null ? null : virtualScroller.value.$el;
  }
  return nonVirtualScroller.value;
});

const { tableConfig } = toRefs(props);
const collapserSize = computed(() =>
  tableConfig.value.showCollapser ? SPECIAL_COLUMNS_SIZE : 0,
);
const selectionSize = computed(() =>
  tableConfig.value.showSelection ? SPECIAL_COLUMNS_SIZE : 0,
);
const rightSideSize = computed(() => {
  return tableConfig.value.showColumnFilters ||
    tableConfig.value.subMenuItems.length > 0 ||
    tableConfig.value.showSubMenu === "always"
    ? SPECIAL_COLUMNS_SIZE
    : 0;
});

const { fitsInsideTotalWidth, innerWidthToBodyWidth } = useAvailableWidth({
  emitAvailableWidth: (newWidth) => emit("update:available-width", newWidth),
  specialColumnsSizeTotal: computed(
    () => collapserSize.value + selectionSize.value + rightSideSize.value,
  ),
  refs: {
    scrolledElement,
  },
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

const headerContainer: Ref<null | HTMLElement> = ref(null);
const getHeaderHeight = () => {
  return headerContainer.value?.offsetHeight ?? 0;
};

const getDragHandleHeightForVirtualScroller = () => {
  const recycleScroller = virtualScroller.value;
  if (recycleScroller === null) {
    return 0;
  }
  const headerHeight = getHeaderHeight();
  /**
   * If the second argument is the smaller one, this means that the scroller is
   * not scrollable at the moment, i.e. adding the header height to the body height
   * is the desired height, as they cannot overlap.
   */
  return Math.min(
    recycleScroller.$el.offsetHeight,
    recycleScroller.$refs.wrapper.offsetHeight + headerHeight,
  );
};

const getDragHandleHeightForNonVirtualScroller = () => {
  return nonVirtualScroller.value?.offsetHeight;
};

const getTransformShiftForRowResize = computed(() => {
  return (scrollIndex: number) =>
    `translateY(${
      props.rowResize.active &&
      scrollIndex > props.rowResize.currentResizedScrollIndex
        ? props.rowResize.currentRowSizeDelta
        : 0
    }px)`;
});

defineExpose({
  scrollToPosition: (scrollPosition: number) =>
    virtualScroller.value?.scrollToPosition(scrollPosition),
  getScrollStart: () => virtualScroller.value?.getScroll().start,
  getRecycleScrollerWrapper: () => virtualScroller.value?.$refs.wrapper,
  refreshScroller: () => virtualScroller.value?.scrollToPosition(0),
});
</script>

<template>
  <template v-if="showVirtualScroller">
    <RecycleScroller
      ref="virtualScroller"
      :style="{
        '--current-body-width': `${currentBodyWidth}px`,
        overflowY: rowResize.active ? 'hidden' : 'auto',
      }"
      :items="scrollData[0]"
      :num-items-above="recycleScrollerConfig.numRowsAbove"
      :num-items-below="recycleScrollerConfig.numRowsBelow"
      :empty-item="{
        data: [],
        size: recycleScrollerConfig.scrollerItemSize,
        tableConfig: {
          showCollapser: false,
          showSelection: false,
          subMenuItems: [],
          showPopovers: false,
        },
        showDragHandle: false,
      }"
      class="scroller"
      :emit-update="true"
      :page-mode="false"
      list-tag="tbody"
      item-tag="tr"
      @scroll="closeExpandedSubMenu"
      @update="
        (startIndex: number, endIndex: number) =>
          $emit('scroller-update', startIndex, endIndex)
      "
    >
      <template #before>
        <div ref="headerContainer" class="header-container">
          <slot
            name="header"
            :get-drag-handle-height="getDragHandleHeightForVirtualScroller"
          />
        </div>
      </template>
      <template #in-wrapper>
        <slot name="cell-selection-overlay" />
      </template>
      <template #default="{ item }">
        <PlaceholderRow
          v-if="item.dots"
          :height="item.size"
          :style="{
            transform: getTransformShiftForRowResize(item.scrollIndex),
          }"
        />
        <slot
          v-else
          name="row"
          :row="item.data"
          :row-ind="item.index"
          :scroll-index="item.scrollIndex"
          :table-config="item.tableConfig"
          :is-top="item.isTop"
          :register-expanded-sub-menu="registerExpandedSubMenu"
          :transform="getTransformShiftForRowResize(item.scrollIndex)"
        />
      </template>
    </RecycleScroller>
  </template>
  <template v-else>
    <div
      ref="nonVirtualScroller"
      :class="[
        'groups-wrapper',
        {
          'horizontal-scroll':
            !columnResize.active && !fitsWithoutHorizontalScrollbar,
          'vertical-scroll': !columnResize.active,
        },
      ]"
      @scroll="closeExpandedSubMenu"
    >
      <slot
        name="header"
        :width="currentBodyWidth"
        :get-drag-handle-height="getDragHandleHeightForNonVirtualScroller"
      />
      <Group
        v-for="(dataGroup, groupInd) in scrollData"
        :key="groupInd"
        :style="{ width: `${currentBodyWidth}px` }"
        :title="getGroupName(groupInd)"
        :group-sub-menu-items="tableConfig.groupSubMenuItems"
        :show="scrollData.length > 1 && dataGroup.length > 0"
        @group-sub-menu-expand="registerExpandedSubMenu"
        @group-sub-menu-click="
          (event: any) => $emit('group-sub-menu-click', event, dataGroup)
        "
      >
        <slot
          v-if="currentRectId === groupInd"
          name="cell-selection-overlay"
          :group-ind="groupInd"
        />
        <slot
          v-for="(row, rowInd) in dataGroup"
          name="row"
          :row="row.data"
          :row-ind="rowInd"
          :scroll-index="rowInd"
          :group-ind="groupInd"
          :is-top="true"
          :register-expanded-sub-menu="registerExpandedSubMenu"
        />
      </Group>
    </div>
  </template>
</template>

<style scoped lang="postcss">
.scroller {
  flex: 1 1 0;
  overflow-x: auto;

  /* stylelint-disable-next-line selector-class-pattern */
  & :deep(.vue-recycle-scroller__item-wrapper) {
    width: calc(var(--current-body-width));
  }

  /* stylelint-disable-next-line selector-class-pattern */
  & :deep(.vue-recycle-scroller__slot) {
    display: flex;
    position: sticky;
    top: 0;
    z-index: var(--z-index-sticky-header);
  }

  & .header-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.groups-wrapper {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: hidden;

  &.vertical-scroll {
    overflow-y: auto;
  }

  &.horizontal-scroll {
    overflow-x: auto;
  }
}

:deep(tbody) {
  display: block;
  min-height: 0;
  flex-shrink: 0;
}

:deep(td > a) {
  text-decoration: none;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
  padding-right: 15px;
}

:deep(td:first-child > a) {
  padding-left: 15px;
}
</style>
