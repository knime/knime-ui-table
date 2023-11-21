<script lang="ts">
/* eslint-disable max-lines */
import TopControls from "./control/TopControls.vue";
import BottomControls from "./control/BottomControls.vue";
import ColumnFilters from "./filter/ColumnFilters.vue";
import Header from "./layout/Header.vue";
import Group from "./layout/Group.vue";
import Row from "./layout/Row.vue";
import PlaceholderRow from "./ui/PlaceholderRow.vue";
import ActionButton from "./ui/ActionButton.vue";
import CellSelectionOverlay from "./ui/CellSelectionOverlay.vue";
import TablePopover from "./popover/TablePopover.vue";
// @ts-ignore
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { useTotalWidth } from "./composables/useAvailableWidth";
import useCellSelection from "./composables/useCellSelection";
import useCellCopying from "./composables/useCellCopying";
import useBoolean from "./composables/useBoolean";

import type DataConfig from "./types/DataConfig";

import {
  DEFAULT_ROW_HEIGHT,
  COMPACT_ROW_HEIGHT,
  ROW_MARGIN_BOTTOM,
  ENABLE_SCROLL_AFTER_ROW_RESIZE_DELAY,
} from "@/util/constants";
import { getPropertiesFromColumns } from "@/util";
import { computed, ref, type Ref, type PropType } from "vue";
import TableCore from "./TableCore.vue";

/**
 * @see README.md
 *
 * @todo WEBP-590: Add README.md + docs/demo.
 * @todo WEBP-591: Split into multiple files.
 */
export default {
  components: {
    TopControls,
    BottomControls,
    ColumnFilters,
    Header,
    Group,
    Row,
    PlaceholderRow,
    ActionButton,
    TablePopover,
    RecycleScroller,
    CellSelectionOverlay,
    TableCore,
  } as any,
  props: {
    /**
     * Data props.
     */
    data: {
      type: Array,
      default: () => [],
    },
    currentSelection: {
      type: Array as PropType<Array<Array<boolean>>>,
      default: () => [],
    },
    /**
     * Only used when tableConfig.enableVirtualScrolling is true.
     * It specifies how many (empty) rows should be simultated above the given rows in this.data[0]
     */
    numRowsAbove: {
      type: Number,
      default: 0,
    },
    /**
     * Only used when tableConfig.enableVirtualScrolling is true.
     * It specifies how many (empty) rows should be simultated below the given rows in this.data[0]
     */
    numRowsBelow: {
      type: Number,
      default: 0,
    },
    /**
     * Data displayed when scrolling to the bottom of the table. Currently only supproted together
     * with virtual scrolling enabled.
     */
    bottomData: {
      type: Array,
      default: () => [],
    },
    /**
     * analogous to currentSelection but for the bottomData
     */
    currentBottomSelection: {
      type: Array,
      default: () => [],
    },
    totalSelected: {
      type: Number,
      default: 0,
    },
    /**
     * Config props.
     */
    dataConfig: {
      type: Object as PropType<DataConfig>,
      default: () => ({}),
    },
    tableConfig: {
      type: Object,
      default: () => ({}),
      validate(tableConfig: any) {
        if (typeof tableConfig !== "object") {
          return false;
        }
        const requiredProperties = [
          "showSelection",
          "showCollapser",
          "showPopovers",
          "showColumnFilters",
          "showBottomControls",
          "subMenuItems",
          "groupSubMenuItems",
        ];
        let isValid = requiredProperties.every((key) =>
          tableConfig.hasOwnProperty(key),
        );
        const requiredConfigs = {
          pageConfig: [
            "currentSize",
            "tableSize",
            "pageSize",
            "possiblePageSizes",
            "currentPage",
          ],
          searchConfig: ["searchQuery"],
          timeFilterConfig: ["currentTimeFilter"],
          columnSelectionConfig: ["possibleColumns", "currentColumns"],
          groupByConfig: ["possibleGroups", "currentGroup"],
          sortConfig: ["sortColumn", "sortDirection"],
          actionButtonConfig: ["text", "callback"],
        };
        return (
          isValid &&
          Object.entries(requiredConfigs).every((key: any, values: any) => {
            if (tableConfig[key]) {
              return values.every((configOption: any) =>
                tableConfig[key].hasOwnProperty(configOption),
              );
            }
            return true;
          })
        );
      },
    },
  },
  emits: [
    "timeFilterUpdate",
    "columnUpdate",
    "columnReorder",
    "groupUpdate",
    "search",
    "pageChange",
    "pageSizeUpdate",
    "columnSort",
    "columnFilter",
    "clearFilter",
    "toggleFilter",
    "selectAll",
    "rowSelect",
    "tableInput",
    "columnResize",
    "headerSubMenuItemSelection",
    "lazyload",
    "allColumnsResize",
    "columnResizeStart",
    "columnResizeEnd",
    "update:available-width",
    "rowHeightUpdate",
    "copySelection",
  ],
  setup(props, { emit }) {
    const wrapper: Ref<any> = ref(null);
    const tableCore: Ref<typeof TableCore | null> = ref(null);
    const selectionOverlay: Ref<any> = ref([]);
    const totalWidth = useTotalWidth(wrapper);
    const enableCellSelection = computed(() =>
      Boolean(props.tableConfig.enableCellSelection),
    );
    // cell selection
    const cellSelection = useCellSelection(enableCellSelection);
    const selectCellsOnMove = useBoolean(false);
    // cell copying
    const emitCopySelection = ({ withHeaders }: { withHeaders: boolean }) => {
      const { rectMinMax, currentRectId } = cellSelection;
      if (rectMinMax.value) {
        emit("copySelection", {
          rect: rectMinMax.value,
          id: currentRectId.value,
          withHeaders,
        });
      }
    };
    const { changeFocus, handleCopyOnKeydown } = useCellCopying({
      selectionOverlay,
      onCopy: emitCopySelection,
    });

    return {
      wrapper,
      totalWidth,
      tableCore,
      selectionOverlay,
      selectCellsOnMove,
      ...cellSelection,
      changeFocus,
      handleCopyOnKeydown,
    };
  },
  data() {
    return {
      filterActive: this.tableConfig.columnFilterInitiallyActive || false,
      popoverTarget: null,
      popoverData: null,
      popoverColumn: null,
      popoverRenderer: null,
      lastScrollIndex: 0,
      newVal: null,
      resizeCount: 0,
      updatedBefore: false,
      currentExpanded: new Set(),
      rowMarginBottom: ROW_MARGIN_BOTTOM,
      wrapperWidth: 0,
      // used for temporarily hiding the vertical scrollbar while changing column sizes to avoid flickering
      columnResizeActive: false,
      closeExpandedSubMenu: () => {},
      scrollerId: "scroller",
      resizedRowHeight: null as null | number,
      currentResizedScrollIndex: null as null | number,
      currentRowSizeDelta: null as null | number,
    };
  },
  computed: {
    currentRowHeight() {
      return this.resizedRowHeight ?? this.initialRowHeight;
    },
    initialRowHeight() {
      return this.dataConfig.rowConfig.compactMode
        ? COMPACT_ROW_HEIGHT
        : this.dataConfig.rowConfig?.rowHeight || DEFAULT_ROW_HEIGHT;
    },
    minRowHeight() {
      return this.dataConfig.rowConfig.compactMode
        ? COMPACT_ROW_HEIGHT
        : DEFAULT_ROW_HEIGHT;
    },
    /*
     * Current table config. E.g. if 4/10 columns displayed, 'current' fields return values w/ length 4.
     */
    columnHeaders() {
      return getPropertiesFromColumns(this.dataConfig.columnConfigs, "header");
    },
    columnSubHeaders() {
      return getPropertiesFromColumns(
        this.dataConfig.columnConfigs,
        "subHeader",
      );
    },
    columnHeaderSubMenuItems() {
      return getPropertiesFromColumns(
        this.dataConfig.columnConfigs,
        "headerSubMenuItems",
      );
    },
    columnSizes() {
      return getPropertiesFromColumns(this.dataConfig.columnConfigs, "size");
    },
    columnTypes() {
      return getPropertiesFromColumns(this.dataConfig.columnConfigs, "type");
    },
    columnFilterConfigs() {
      return getPropertiesFromColumns(
        this.dataConfig.columnConfigs,
        "filterConfig",
      );
    },
    columnKeys() {
      return getPropertiesFromColumns(this.dataConfig.columnConfigs, "key");
    },
    columnSortConfigs() {
      return this.dataConfig.columnConfigs.map((columnConfig: any) =>
        columnConfig.hasOwnProperty("isSortable")
          ? columnConfig.isSortable
          : true,
      );
    },
    columnHeaderColors() {
      return getPropertiesFromColumns(
        this.dataConfig.columnConfigs,
        "headerColor",
      );
    },
    slottedColumns() {
      return getPropertiesFromColumns(
        this.dataConfig.columnConfigs,
        "hasSlotContent",
      )
        .map((hasSlotContent: any, colInd: any) =>
          hasSlotContent ? colInd : null,
        )
        .filter((colInd: any) => colInd !== null);
    },
    popoverRenderers() {
      return getPropertiesFromColumns(
        this.dataConfig.columnConfigs,
        "popoverRenderer",
      ).map((renderer: any, colInd: any) => {
        if (renderer && typeof renderer === "boolean") {
          renderer = this.columnTypes[colInd];
        }
        return renderer;
      });
    },
    tableHeaderClass() {
      return [
        "table-header",
        {
          "sub-menu-active":
            this.tableConfig.subMenuItems?.length &&
            !this.tableConfig.showColumnFilters,
        },
      ];
    },
    enableVirtualScrolling() {
      return this.tableConfig.enableVirtualScrolling;
    },
    showVirtualScroller() {
      return this.enableVirtualScrolling && this.scrollData.length === 1;
    },
    topDataLength() {
      if (this.data === null || this.data.length === 0) {
        return 0;
      }
      // @ts-ignore
      return this.data[0].length;
    },
    scrollData() {
      if (this.data === null || this.data.length === 0) {
        return [];
      }
      const data = this.data?.map((groupData: any) =>
        groupData.map((rowData: any, index: any) => {
          const id = (index + this.numRowsAbove).toString();
          return {
            id,
            data: rowData,
            size: this.scrollerItemSize,
            index,
            scrollIndex: index + this.numRowsAbove,
            isTop: true,
          };
        }),
      );
      if (this.enableVirtualScrolling) {
        if (this.bottomData.length > 0) {
          let hasPlaceholder = this.topDataLength > 0;
          if (hasPlaceholder) {
            data[0].push({
              id: "dots",
              size: this.scrollerItemSize,
              scrollIndex: this.numRowsAbove + this.topDataLength,
              dots: true,
            });
          }
          this.bottomData.forEach((rowData, index) => {
            const scrollIndex =
              index +
              this.numRowsAbove +
              this.topDataLength +
              (hasPlaceholder ? 1 : 0);
            const id = scrollIndex.toString();
            data[0].push({
              id,
              data: rowData,
              size: this.scrollerItemSize,
              index,
              scrollIndex,
              isTop: false,
            });
          });
        }
      }
      this.currentExpanded.forEach((scrollIndex: any) => {
        const contentHeight = this.getContentHeight(scrollIndex);
        data[0][scrollIndex - this.numRowsAbove].size += contentHeight;
      });
      return data;
    },
    currentSelectionMap() {
      if (!this.tableConfig.showSelection) {
        return () => false;
      }
      return (rowInd: number, groupInd: number, isTop: any) => {
        return isTop
          ? this.currentSelection[groupInd][rowInd]
          : this.currentBottomSelection[rowInd];
      };
    },
    enableRowResize() {
      return this.dataConfig.rowConfig.enableResizing;
    },
    scrollerItemSize() {
      if (this.currentRowHeight === "dynamic") {
        return this.minRowHeight;
      }
      // The virtual scroller does not support margins, hence we need to set a different height for the rows
      // instead
      return this.currentRowHeight + ROW_MARGIN_BOTTOM;
    },
  },
  watch: {
    "tableConfig.showColumnFilters": {
      handler(newVal) {
        if (!newVal && this.filterActive) {
          this.onToggleFilter();
          this.onClearFilter();
        }
      },
    },
    "dataConfig.rowConfig.compactMode": {
      handler() {
        this.resetRowHeight();
      },
    },
    "dataConfig.rowConfig.rowHeight": {
      handler() {
        this.resetRowHeight();
      },
    },
    currentRowHeight(newRowHeight) {
      this.$emit("rowHeightUpdate", newRowHeight);
    },
  },
  methods: {
    // Utilities
    getGroupName(ind: number) {
      return this.tableConfig.groupByConfig?.currentGroupValues?.[ind] || "";
    },
    refreshScroller() {
      this.tableCore?.refreshScroller();
    },
    resetRowHeight() {
      this.resizedRowHeight = null;
    },
    // Event handling
    onScroll(startIndex: number, endIndex: number) {
      if (
        this.lastScrollIndex === endIndex ||
        this.currentResizedScrollIndex !== null
      ) {
        return;
      }
      const direction = this.lastScrollIndex < endIndex ? 1 : -1;
      this.lastScrollIndex = endIndex;
      this.collapseAllUnusedRows(startIndex, endIndex);
      this.$emit("lazyload", { direction, startIndex, endIndex });
    },
    collapseAllUnusedRows(startIndex: number, endIndex: number) {
      let needsCollapse = false;
      const usedExpanded = new Set();
      this.currentExpanded.forEach((i: any) => {
        if (i < endIndex && i >= startIndex) {
          usedExpanded.add(i);
        } else {
          needsCollapse = true;
        }
      });
      if (needsCollapse) {
        this.currentExpanded = usedExpanded;
      }
    },
    onTimeFilterUpdate(newTimeFilter: any) {
      consola.debug(`TableUI emitting: timeFilterUpdate ${newTimeFilter}`);
      this.clearCellSelection();
      this.$emit("timeFilterUpdate", newTimeFilter);
    },
    onColumnUpdate(newColumnList: any) {
      consola.debug(`TableUI emitting: columnUpdate ${newColumnList}`);
      this.clearCellSelection();
      this.$emit("columnUpdate", newColumnList);
    },
    onColumnReorder(colInd: number, newColInd: number) {
      consola.debug(`TableUI emitting: columnReorder ${colInd} ${newColInd}`);
      this.clearCellSelection();
      this.$emit("columnReorder", colInd, newColInd);
    },
    onGroupUpdate(group: any) {
      consola.debug(`TableUI emitting: groupUpdate ${group}`);
      this.clearCellSelection();
      this.$emit("groupUpdate", group);
    },
    onSearch(input: any) {
      consola.debug(`TableUI emitting: search ${input}`);
      this.clearCellSelection();
      this.$emit("search", input);
    },
    onPageChange(pageNumberDiff: any) {
      consola.debug(`TableUI emitting: pageChange ${pageNumberDiff}`);
      this.clearCellSelection();
      this.$emit("pageChange", pageNumberDiff);
    },
    onPageSizeUpdate(newPageSize: number) {
      consola.debug(`TableUI emitting: pageSizeUpdate ${newPageSize}`);
      this.clearCellSelection();
      this.$emit("pageSizeUpdate", newPageSize);
    },
    onColumnSort(colInd: number) {
      consola.debug(`TableUI emitting: columnSort ${colInd}`);
      this.clearCellSelection();
      this.$emit("columnSort", colInd);
    },
    onColumnFilter(colInd: number, value: any) {
      consola.debug(`TableUI emitting: columnFilter ${colInd} ${value}`);
      this.clearCellSelection();
      this.$emit("columnFilter", colInd, value);
    },
    onClearFilter() {
      consola.debug("TableUI emitting: clearFilter");
      this.clearCellSelection();
      this.$emit("clearFilter");
    },
    onToggleFilter() {
      this.filterActive = !this.filterActive;
      consola.debug(`TableUI emitting: toggleFilter ${this.filterActive}`);
      this.clearCellSelection();
      this.$emit("toggleFilter", this.filterActive);
    },
    onSelectAll(selected: any) {
      consola.debug(`TableUI emitting: selectAll ${selected}`);
      this.$emit("selectAll", selected);
    },
    onHeaderSubMenuItemSelection(item: any, colInd: any) {
      consola.debug(
        `TableUI emitting: headerSubMenuItemSelection ${item} ${colInd}`,
      );
      this.$emit("headerSubMenuItemSelection", item, colInd);
    },
    onRowSelect(
      selected: any,
      rowInd: number,
      groupInd: number,
      isTop: boolean,
    ) {
      consola.debug(
        `TableUI emitting: rowSelect ${selected} ${rowInd} ${groupInd} ${isTop}`,
      );
      this.$emit("rowSelect", selected, rowInd, groupInd, isTop);
    },
    onRowExpand(expanded: boolean, scrollIndex: number) {
      // We need to change the reference of this.currentExpanded so that this.scrollerData gets recomputed.
      if (expanded) {
        this.currentExpanded.add(scrollIndex);
        this.currentExpanded = new Set(this.currentExpanded);
      } else {
        const hasDeleted = this.currentExpanded.delete(scrollIndex);
        if (hasDeleted) {
          this.currentExpanded = new Set(this.currentExpanded);
        }
      }
    },
    onResizeRow(rowSizeDelta: number, scrollIndex: number) {
      this.currentRowSizeDelta = rowSizeDelta;
      this.currentResizedScrollIndex = scrollIndex;
    },
    onResizeAllRows(currentSize: number, row: any, scrollIndex: number) {
      if (this.currentRowHeight === "dynamic") {
        return;
      }
      this.currentRowSizeDelta = 0;
      if (this.enableVirtualScrolling) {
        const previousScrollTop = this.tableCore?.getScrollStart();
        const heightAboveCurrentRow = scrollIndex * this.currentRowHeight;
        const offset = heightAboveCurrentRow - previousScrollTop;
        this.resizedRowHeight = currentSize;
        const scrollPosition = scrollIndex * this.currentRowHeight - offset;
        this.keepScrollerPositionOnRowResize(scrollPosition);
      } else {
        this.resizedRowHeight = currentSize;
        row.scrollIntoView();
      }
    },
    keepScrollerPositionOnRowResize(scrollPosition: number) {
      const resizeObserver = new ResizeObserver(() => {
        setTimeout(() => {
          // scroll was temporarily disabled to avoid sending scroll events during resize
          this.currentResizedScrollIndex = null;
        }, ENABLE_SCROLL_AFTER_ROW_RESIZE_DELAY);
        this.tableCore?.scrollToPosition(scrollPosition);
        resizeObserver.disconnect();
      });
      resizeObserver.observe(this.tableCore?.getRecycleScrollerWrapper());
    },
    onRowInput(event: any) {
      consola.debug(`TableUI emitting: tableInput ${event}`);
      this.$emit("tableInput", event);
      this.openPopover(event);
    },
    onGroupSubMenuClick(event: any, group: any) {
      consola.debug(`TableUI group submenu clicked ${event} ${group}`);
      event.callback(group, this);
    },
    onRowSubMenuClick(event: any, row: any) {
      consola.debug(`TableUI row submenu clicked ${event} ${row}`);
      if (event.callback) {
        event.callback(row, this);
      }
    },
    openPopover(event: any) {
      consola.debug("TableUI: open popover", event);
      this.popoverColumn = this.columnKeys[event.colInd];
      this.popoverRenderer =
        this.popoverRenderers[event.colInd] || this.columnTypes[event.colInd];
      this.popoverData =
        // @ts-ignore
        this.data[event.groupInd][event.rowInd][this.popoverColumn];
      this.popoverTarget = event.cell;
      window.addEventListener("resize", this.onPopoverClose);
    },
    onPopoverClose() {
      consola.debug("TableUI: close popover");
      this.popoverTarget = null;
      this.popoverColumn = null;
      this.popoverRenderer = null;
      this.popoverData = null;
      window.removeEventListener("resize", this.onPopoverClose);
    },
    onColumnResize(columnIndex: number, newColumnSize: number) {
      this.$emit("columnResize", columnIndex, newColumnSize);
    },
    onAllColumnsResize(newColumnSize: number) {
      this.$emit("allColumnsResize", newColumnSize);
    },
    onColumnResizeStart() {
      this.columnResizeActive = true;
      this.$emit("columnResizeStart");
    },
    onColumnResizeEnd() {
      this.columnResizeActive = false;
      this.$emit("columnResizeEnd");
    },
    // Find the additional height added by expanded content of a row
    getContentHeight(index: number) {
      // The second child of the dom element referenced by the row is the expanded content.
      const contentHeight =
        // @ts-ignore
        this.$refs[`row-${index}`]?.$el.children[1]?.clientHeight;
      return contentHeight || 0;
    },
    getCellContentSlotName(columnKeys: any, columnId: any) {
      // see https://vuejs.org/guide/essentials/template-syntax.html#dynamic-argument-syntax-constraints
      return `cellContent-${columnKeys[columnId]}`;
    },
    getHeaderComponent() {
      return this.$refs.header;
    },
    getRowComponents() {
      const rowComponents: any[] = [];
      this.data.forEach((group: any, groupIndex) => {
        group.forEach((_: any, rowIndex: number) =>
          rowComponents.push(
            // @ts-ignore
            this.$refs[this.getRowRefName(groupIndex, rowIndex)],
          ),
        );
      });
      return rowComponents;
    },
    getRowData(row: Record<string, unknown> | Array<unknown>) {
      const isEmptyArray = Array.isArray(row) && row.length === 0;
      return isEmptyArray
        ? row
        : this.columnKeys.map(
            (column: any) => (row as Record<string, unknown>)[column],
          );
    },
    getRowRefName(groupInd: null | number, rowInd: number) {
      if (groupInd === null) {
        return `row-${rowInd}`;
      }
      return `group-${groupInd}-row-${rowInd}`;
    },
  },
};
</script>

<template>
  <table
    ref="wrapper"
    :tabindex="-1"
    @pointerleave="selectCellsOnMove.setFalse"
    @pointerdown.passive.stop="
      $event.button === 0 && selectCellsOnMove.setTrue()
    "
    @pointerup.passive="$event.button === 0 && selectCellsOnMove.setFalse()"
    @keydown.ctrl.shift.c.exact="handleCopyOnKeydown"
    @keydown.meta.shift.c.exact="handleCopyOnKeydown"
    @focusin="changeFocus(true)"
    @focusout="changeFocus(false)"
  >
    <TopControls
      :table-config="tableConfig"
      :column-headers="columnHeaders"
      @next-page="onPageChange(1)"
      @prev-page="onPageChange(-1)"
      @column-update="onColumnUpdate"
      @column-reorder="onColumnReorder"
      @group-update="onGroupUpdate"
      @search-update="onSearch"
      @time-filter-update="onTimeFilterUpdate"
    />
    <TableCore
      ref="tableCore"
      :scroll-data="scrollData"
      :total-width="totalWidth"
      :column-sizes="columnSizes"
      :column-resize="{ active: columnResizeActive }"
      :row-resize="
        currentResizedScrollIndex === null || currentRowSizeDelta == null
          ? { active: false }
          : { active: true, currentResizedScrollIndex, currentRowSizeDelta }
      "
      :table-config="tableConfig"
      :current-rect-id="currentRectId"
      :recycle-scroller-config="{
        scrollerItemSize,
        numRowsAbove,
        numRowsBelow,
      }"
      :current-row-height="currentRowHeight"
      @group-sub-menu-click="onGroupSubMenuClick"
      @scroller-update="onScroll"
      @update:available-width="$emit('update:available-width', $event)"
    >
      <template
        #row="{
          row,
          groupInd = null,
          rowInd,
          scrollIndex,
          isTop,
          tableConfig: itemTableConfig = null,
          transform = null,
          registerExpandedSubMenu,
        }"
      >
        <Row
          :key="row.id"
          :ref="getRowRefName(groupInd, rowInd)"
          :row-data="data"
          :row="getRowData(row)"
          :table-config="itemTableConfig || tableConfig"
          :show-drag-handle="
            enableRowResize &&
            (!itemTableConfig || itemTableConfig.enableRowResize)
          "
          :column-configs="dataConfig.columnConfigs"
          :row-config="dataConfig.rowConfig"
          :row-height="currentRowHeight"
          :min-row-height="minRowHeight"
          :margin-bottom="rowMarginBottom"
          :is-selected="currentSelectionMap(rowInd, groupInd || 0, isTop)"
          :select-cells-on-move="selectCellsOnMove.state"
          :style="transform === null ? {} : { transform }"
          @row-select="onRowSelect($event, rowInd, groupInd || 0, isTop)"
          @cell-select="
            (cellInd: number) =>
              selectCell(
                { x: cellInd, y: scrollIndex },
                groupInd === null ? isTop : groupInd,
              )
          "
          @expand-cell-select="
            (cellInd: number) =>
              expandCellSelection(
                { x: cellInd, y: scrollIndex },
                groupInd === null ? isTop : groupInd,
              )
          "
          @row-expand="onRowExpand($event, scrollIndex)"
          @row-input="
            onRowInput({
              ...$event,
              rowInd,
              id: row.id,
              groupInd: 0,
              isTop,
            })
          "
          @row-sub-menu-expand="registerExpandedSubMenu"
          @row-sub-menu-click="(event: any) => onRowSubMenuClick(event, row)"
          @resize-all-rows="
            (currentSize: number, row: any) =>
              onResizeAllRows(currentSize, row, scrollIndex)
          "
          @resize-row="
            (rowSizeDelta: number) => onResizeRow(rowSizeDelta, scrollIndex)
          "
        >
          <!-- Vue requires named slots on "custom" elements (i.e. template). -->
          <!-- eslint-disable vue/valid-v-slot -->
          <template
            v-for="colInd in slottedColumns"
            #[getCellContentSlotName(columnKeys,colInd)]="cellData"
            :key="rowInd + '_' + colInd"
          >
            <slot
              :name="`cellContent-${columnKeys[colInd]}`"
              :data="{
                ...cellData,
                key: columnKeys[colInd],
                rowInd: rowInd,
                colInd,
              }"
            />
          </template>
          <template #rowCollapserContent>
            <slot name="collapserContent" :row="data" />
          </template>
        </Row>
      </template>
      <template #header="{ getDragHandleHeight, width = null }">
        <Header
          ref="header"
          :style="width === null ? {} : { width: `${width}px` }"
          :table-config="tableConfig"
          :column-headers="columnHeaders"
          :column-sub-headers="columnSubHeaders"
          :column-sizes="columnSizes"
          :column-sub-menu-items="columnHeaderSubMenuItems"
          :column-sort-configs="columnSortConfigs"
          :column-header-colors="columnHeaderColors"
          :is-selected="totalSelected > 0"
          :filters-active="filterActive"
          :get-drag-handle-height="getDragHandleHeight"
          :class="tableHeaderClass"
          @header-select="onSelectAll"
          @column-sort="onColumnSort"
          @toggle-filter="onToggleFilter"
          @column-resize="onColumnResize"
          @all-columns-resize="onAllColumnsResize"
          @column-resize-start="onColumnResizeStart"
          @column-resize-end="onColumnResizeEnd"
          @sub-menu-item-selection="onHeaderSubMenuItemSelection"
        />
        <ColumnFilters
          v-if="filterActive"
          class="column-filter"
          :style="width === null ? {} : { width: `${width}px` }"
          :filter-configs="columnFilterConfigs"
          :column-headers="columnHeaders"
          :column-sizes="columnSizes"
          :types="columnTypes"
          :show-collapser="tableConfig.showCollapser"
          :show-selection="tableConfig.showSelection"
          @column-filter="onColumnFilter"
          @clear-filter="onClearFilter"
        />
      </template>
      <template #cell-selection-overlay>
        <CellSelectionOverlay
          v-if="rectMinMax"
          ref="selectionOverlay"
          :rect="rectMinMax"
          :row-height="scrollerItemSize"
          :table-config="tableConfig"
          :row-resize-index="currentResizedScrollIndex"
          :row-resize-delta="currentRowSizeDelta"
          :column-sizes="columnSizes"
        />
      </template>
    </TableCore>
    <BottomControls
      v-if="tableConfig.showBottomControls"
      :page-config="tableConfig.pageConfig"
      @next-page="onPageChange(1)"
      @prev-page="onPageChange(-1)"
      @page-size-update="onPageSizeUpdate"
    />
    <ActionButton
      v-else-if="tableConfig.actionButtonConfig"
      :config="tableConfig.actionButtonConfig"
    />
    <TablePopover
      v-if="popoverTarget && typeof popoverData !== 'undefined'"
      ref="tablePopover"
      initially-expanded
      :use-button="false"
      :data="popoverData"
      :target="popoverTarget"
      :renderer="popoverRenderer"
      @close="onPopoverClose"
    >
      <template #content>
        <slot
          name="popoverContent"
          :data="popoverData"
          :column="popoverColumn"
        />
      </template>
    </TablePopover>
  </table>
</template>

<style lang="postcss" scoped>
table {
  height: 100%;
  width: 100%;
  font-size: 13px;
  font-weight: 400;
  table-layout: fixed;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  margin-right: auto;

  &:focus {
    outline: none;
  }
}

.empty-message {
  font-size: 13px;
  line-height: 18px;
}

:deep(.more-button) {
  /* standard focus on button interferes when clicked */
  & button:focus {
    color: var(--knime-masala);
    background-color: var(--knime-silver-sand-semi);
  }
}

@media only screen and (width <= 1180px) {
  table {
    table-layout: fixed;
    width: 100%;

    & th,
    & :deep(td > a) {
      padding-right: 0;
      padding-left: 5px;
      margin-left: 0;
    }
  }
}

@media only screen and (width <= 750px) {
  table {
    & :deep(.name) {
      width: 40%;
      align-items: center;
    }

    & :deep(td.name) {
      line-height: unset;
      white-space: pre-wrap;

      & a {
        display: -webkit-box; /* stylelint-disable-line value-no-vendor-prefix */
        -webkit-line-clamp: 2; /* number of lines to show */
        -webkit-box-orient: vertical;
      }
    }

    & :deep(.owner) {
      width: 30%;
    }

    & :deep(.start-date) {
      width: 25%;
    }

    & :deep(.state) {
      width: 5%;

      &::before {
        padding-left: 5px;
      }
    }

    & :deep(th.state) {
      overflow: visible;
      padding-left: 0;
    }
  }
}
</style>
