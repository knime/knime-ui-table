<script setup>
import { computed, reactive } from "vue";
import TableUIWithAutoSizeCalculation from "@/components/TableUIWithAutoSizeCalculation.vue";
import { FunctionButton } from "@knime/components";
import demoProps from "./props.json";
import { columnTypes, tablePageSizes } from "@/config/table.config";

import {
  useFilters,
  useGroups,
  usePages,
  useSorting,
  useDataProcessing,
  useColumnSelection,
  useFormatters,
  useColumnResizing,
  useSelection,
  generateAllData,
  useCheckboxItem,
} from "./utils";

const props = defineProps({
  allDataLength: {
    type: Number,
    default: 10,
  },
  desiredNumCols: {
    type: Number,
    default: demoProps.allColumnKeys.length,
  },
  showAllColumns: {
    type: Boolean,
    default: false,
  },
  bottomData: {
    type: Array,
    default: () => [],
  },
  initialFilterValues: {
    type: Object,
    default: () => ({}),
  },
  initialSortColumn: {
    type: Number,
    default: null,
  },
  initialSortDirection: {
    type: Number,
    default: null,
    validator(value) {
      return value === null || value === -1 || value === 1;
    },
  },
  withSorting: Boolean,
  withSpecificSortConfigs: Boolean,
  showTimeFilter: Boolean,
  defaultTimeFilter: {
    type: String,
    default: "All time",
  },
  withColumnSelection: Boolean,
  withGroupBy: Boolean,
  withSearch: Boolean,
  checkboxSettings: {
    type: Array,
    default: () => [],
  },
  withColumnFilters: Boolean,
  withHeaderSubMenu: Boolean,
  headerSubMenu: {
    type: Array,
    default: null,
  },
  showBottomControls: Boolean,
  showCollapser: Boolean,
  showSubHeaders: Boolean,
  withSelection: Boolean,
  disableSelection: Boolean,
  withCellSelection: Boolean,
  showActionButton: Boolean,
  allSlottedColumns: {
    type: Array,
    default: () => [],
  },
  showPopovers: Boolean,
  compactMode: Boolean,
  rowHeight: {
    type: Number,
    default: null,
  },
  dynamicRowHeight: {
    type: Boolean,
    default: false,
  },
  enableRowResize: Boolean,
  enableColumnResize: Boolean,
  enableVirtualScrolling: Boolean,
  fixHeader: Boolean,
  showTableSize: Boolean,
  containerHeight: {
    type: String,
    default: "",
  },
  backgroundColor: {
    type: String,
    required: true,
  },
  withPagination: Boolean,
  pageSize: {
    type: Number,
    default: 10,
  },
  actionButtonText: {
    type: String,
    default: "",
  },
  showSubMenus: Boolean,
  subMenuReservedSpace: {
    type: String,
    default: "auto",
  },
  subMenuItems: {
    type: Array,
    default: () => [],
  },
  showGroupSubMenus: Boolean,
  groupSubMenuItems: {
    type: Array,
    default: () => [],
  },
  numRowsAbove: {
    type: Number,
    default: 0,
  },
  numRowsBelow: {
    type: Number,
    default: 0,
  },
  autoSizeColumnsToBody: Boolean,
  autoSizeColumnsToHeader: Boolean,
  fixedColumnSizes: { type: Object, default: () => ({}) },
});

const {
  allColumnHeadersGenerated,
  allColumnKeysGenerated,
  allColumnTypesGenerated,
  allDataGenerated,
} = generateAllData(props.allDataLength, props.desiredNumCols);
const allColumnsDataGenerated = {
  allColumnHeaders: allColumnHeadersGenerated,
  allColumnKeys: allColumnKeysGenerated,
  allColumnTypes: allColumnTypesGenerated,
};

const {
  onColumnUpdate,
  onColumnReorder,
  filterByColumn,
  allHeadersOrdered,
  currentColumns,
} = useColumnSelection({
  allColumnsData: allColumnsDataGenerated,
  initialColumns: props.showAllColumns
    ? allColumnKeysGenerated
    : demoProps.defaultColumns,
});

const {
  currentColumnSizes,
  onColumnResize,
  onAllColumnsResize,
  updateAvailableWidth: onAvailableWidthUpdate,
  onAutoColumnSizesUpdate,
} = useColumnResizing({
  currentColumnIndices: currentColumns.indices,
  currentColumnKeys: currentColumns.keys,
});

const { domains, updateDomains, currentFormatters } = useFormatters({
  allColumnsData: {
    ...allColumnsDataGenerated,
    allFormatters: demoProps.allFormatters,
  },
  currentColumnKeys: currentColumns.keys,
});

const {
  filterData,
  filterHash,
  onTimeFilterUpdate,
  onColumnFilter,
  onClearFilter,
  onToggleFilter,
  onSearch,
  currentTimeFilter,
  currentFilterConfigs,
  currentTableSize,
} = useFilters({
  initialParameters: props,
  timeFilterKey: demoProps.timeFilterKey,
  defaultTimeFilter: props.defaultTimeFilter,
  formatterData: { domains, currentFormatters },
  currentColumns: currentColumns.keys,
  allColumns: allColumnsDataGenerated,
});

const {
  groupData,
  groupColumnKey,
  groupHash,
  currentGroup,
  groupTitles,
  onGroupUpdate,
} = useGroups({
  columnData: allColumnsDataGenerated,
});

const { sortData, sortHash, columnSort, columnSortDirection, onColumnSort } =
  useSorting({
    initialParameters: props,
    currentColumns,
    groupColumnKey,
  });

const {
  paginateData,
  pageHash,
  goToFirstPage,
  currentPage,
  currentPageSize,
  onPageChange,
  onPageSizeUpdate,
} = usePages({
  withPagination: props.withPagination,
  pageSize: props.pageSize,
  currentTableSize,
});

const { paginatedData, processedIndicies, paginatedIndicies, totalTableSize } =
  useDataProcessing({
    filter: { filterData, filterHash },
    group: { groupData, groupHash },
    sort: { sortData, sortHash },
    paginate: { paginateData, pageHash, goToFirstPage },
    allData: allDataGenerated,
    updateDomains,
  });

const { totalSelected, onSelectAll, onRowSelect, paginatedSelection } =
  useSelection({
    totalTableSize,
    processedIndicies,
    paginatedIndicies,
  });

const currentClassGenerators = computed(() =>
  currentColumns.keys.value.map(
    (colKey) => demoProps.allClassGenerators[colKey] || [],
  ),
);
const currentColumnSpecificSortConfigs = computed(() =>
  filterByColumn(demoProps.allColumnSpecificSortConfigs),
);

const currentSlottedColumns = computed(() =>
  currentColumns.keys.value
    .map((col) => (props.allSlottedColumns.includes(col) ? col : null))
    .filter((col) => col !== null),
);

const currentColumnHeaderColors = computed(() =>
  currentColumns.keys.value.map(
    (columnKey) => demoProps.allColumnHeaderColors[columnKey],
  ),
);

const dataConfig = computed(() => {
  let dataConfig = {
    columnConfigs: [],
    rowConfig: {
      compactMode: props.compactMode,
      ...((props.rowHeight !== null || props.dynamicRowHeight) && {
        rowHeight: props.dynamicRowHeight ? "dynamic" : props.rowHeight,
      }),
      enableResizing: props.enableRowResize,
    },
  };
  currentColumns.keys.value.forEach((key, ind) => {
    if (!key) {
      return;
    }
    let columnConfig = {
      key,
      id: key,
      header: currentColumns.headers.value[ind],
      subHeader: props.showSubHeaders
        ? currentColumns.subHeaders.value[ind]
        : "",
      type: currentColumns.types.value[ind],
      size: currentColumnSizes.value[ind],
      filterConfig: currentFilterConfigs.value[ind],
      formatter: currentFormatters.value[ind],
      classGenerator: currentClassGenerators.value[ind] || [],
      popoverRenderer: demoProps.allPopoverRenderers[key],
      hasSlotContent: currentSlottedColumns.value?.includes(key),
      headerSubMenuItems: props.withHeaderSubMenu ? props.headerSubMenu : null,
      isSortable:
        !props.withSpecificSortConfigs ||
        currentColumnSpecificSortConfigs.value[ind],
      headerColor: currentColumnHeaderColors.value[ind] ?? null,
    };
    dataConfig.columnConfigs.push(columnConfig);
  });
  return dataConfig;
});

const groupByConfig = props.withGroupBy
  ? computed(() => ({
      possibleGroups: allColumnHeadersGenerated.filter(
        (_, colInd) =>
          allColumnTypesGenerated[allColumnKeysGenerated[colInd]] ===
          columnTypes.Nominal,
      ),
      currentGroup: currentGroup.value,
      currentGroupValues: groupTitles.value,
    }))
  : null;

const timeFilterConfig = props.showTimeFilter
  ? reactive({ currentTimeFilter })
  : null;

const searchConfig = props.withSearch ? {} : null;

const columnSelectionConfig = props.withColumnSelection
  ? reactive({
      possibleColumns: allHeadersOrdered,
      currentColumns: currentColumns.headers,
    })
  : null;

const sortConfig = props.withSorting
  ? reactive({ sortColumn: columnSort, sortDirection: columnSortDirection })
  : null;

const actionButtonConfig = props.showActionButton
  ? reactive({
      callback: () => consola.log("action button clicked"),
      text: props.actionButtonText,
    })
  : null;

const pageConfig = reactive({
  tableSize: totalTableSize,
  currentSize: currentTableSize,
  pageSize: currentPageSize,
  possiblePageSizes: tablePageSizes,
  showTableSize: props.showTableSize,
  currentPage,
  fixHeader: props.fixHeader,
});

const tableConfig = reactive({
  showSelection: props.withSelection,
  disableSelection: props.disableSelection,
  enableCellSelection: props.withCellSelection,
  showCollapser: props.showCollapser,
  showPopovers: props.showPopovers,
  showColumnFilters: props.withColumnFilters,
  columnFilterInitiallyActive:
    props.withColumnFilters &&
    Boolean(Object.keys(props.initialFilterValues).length),
  showBottomControls: props.showBottomControls,
  subMenuItems: props.showSubMenus ? props.subMenuItems : [],
  reserveSpaceForSubMenu: props.subMenuReservedSpace,
  groupSubMenuItems: props.showGroupSubMenus ? props.groupSubMenuItems : [],
  enableVirtualScrolling: props.enableVirtualScrolling,
  enableColumnResizing: props.enableColumnResize,
  groupByConfig,
  timeFilterConfig,
  settingsItems: props.checkboxSettings.map(useCheckboxItem),
  searchConfig,
  columnSelectionConfig,
  sortConfig,
  actionButtonConfig,
  pageConfig,
});

const autoColumnSizesOptions = reactive({
  calculateForBody: props.autoSizeColumnsToBody,
  calculateForHeader: props.autoSizeColumnsToHeader,
  fixedSizes: props.fixedColumnSizes || {},
});

const tableProps = reactive({
  data: paginatedData,
  bottomData: props.bottomData,
  currentSelection: paginatedSelection,
  totalSelected,
  dataConfig,
  tableConfig,
  numRowsAbove: props.numRowsAbove,
  numRowsBelow: props.numRowsBelow,
  autoColumnSizesOptions,
});

const getCellContentSlotName = (columnId) => `cellContent-${columnId}`;
const alertEvent =
  (methodName) =>
  (...args) =>
    window.alert(
      `'${methodName}' event emitted:\n ${JSON.stringify(args, null, 4)}`,
    );
const onCopySelection = alertEvent("copySelection");

const htmlSlotContent = `
<div style="
    border: 1px dashed black;
    aspect-ratio: 1/1;
    max-height: 50px;
     min-height: 0;
    font-size: 5px;
    padding: 5px;
    line-height: 10px;
"> 
  <div>
    aspect-ratio: 1/1;
  </div>
  <div>
    max-height: 50px;
  </div> 
  <div>
    min-height: 0;
  </div> 
</div>`;
</script>

<template>
  <div
    ref="root"
    class="root"
    :style="{
      height: containerHeight,
      backgroundColor: `var(${backgroundColor})`,
    }"
  >
    <TableUIWithAutoSizeCalculation
      ref="table"
      v-bind="tableProps"
      @time-filter-update="onTimeFilterUpdate"
      @column-update="onColumnUpdate"
      @column-reorder="onColumnReorder"
      @group-update="onGroupUpdate"
      @search="onSearch"
      @page-change="onPageChange"
      @page-size-update="onPageSizeUpdate"
      @column-sort="onColumnSort"
      @column-filter="onColumnFilter"
      @clear-filter="onClearFilter"
      @toggle-filter="onToggleFilter"
      @select-all="onSelectAll"
      @row-select="onRowSelect"
      @column-resize="onColumnResize"
      @all-columns-resize="onAllColumnsResize"
      @update:available-width="onAvailableWidthUpdate"
      @auto-column-sizes-update="onAutoColumnSizesUpdate"
      @copy-selection="onCopySelection"
    >
      <template
        v-for="col in currentSlottedColumns"
        :key="rowInd + '_' + colInd + '_' + col"
        #[getCellContentSlotName(col)]="{
          data: { row, key, colInd, rowInd },
        } = { data: {} }"
      >
        <img
          :title="` Slot for: ${key}(index:${rowInd}) = ${JSON.stringify(
            row[colInd],
          )}`"
          :style="{ maxHeight: `${20 + 20 * rowInd}px`, display: 'block' }"
          src="https://forum-cdn.knime.com/uploads/default/original/3X/6/8/68ac3f3c3142b63b68b8ba7c58f97a2614bdf1d2.svg"
        />
        <span v-html="htmlSlotContent" />
      </template>
      <template #collapserContent="availableData">
        <h6>Data available in this slot content:</h6>
        <pre>{{ JSON.stringify(availableData, undefined, 4) }}</pre>
      </template>
      <template #popoverContent="slotContent">
        <div
          :style="{ overflowX: 'auto', overflowY: 'auto', maxHeight: '100px' }"
        >
          <h6>Popover content:</h6>
          <pre>
              {{ JSON.stringify(slotContent, null, 4) }}
            </pre
          >
        </div>
      </template>
    </TableUIWithAutoSizeCalculation>
  </div>
  <FunctionButton
    v-if="autoSizeColumnsToBody || autoSizeColumnsToHeader"
    class="trigger-auto-sizing"
    primary
    @click="() => $refs.table.triggerCalculationOfAutoColumnSizes()"
  >
    <span>Trigger auto size</span>
  </FunctionButton>
</template>

<style>
@import url("@knime/styles/css");

:root {
  font-size: 16px;
  line-height: 1.44;
  height: 100vh;
  background-color: var(--knime-porcelain);
}

.trigger-auto-sizing {
  position: fixed;
  right: 5px;
  bottom: 5px;
  z-index: 10;
}
</style>
