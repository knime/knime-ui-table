<script setup>
import { computed, reactive } from "vue";
import TableUI from "@/components/TableUI.vue";
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
} from "./utils";

const props = defineProps({
  allDataLength: {
    type: Number,
    default: 10,
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
  showActionButton: Boolean,
  allSlottedColumns: {
    type: Array,
    default: () => [],
  },
  showPopovers: Boolean,
  compactMode: Boolean,
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
});

const {
  onColumnUpdate,
  onColumnReorder,
  filterByColumn,
  allHeadersOrdered,
  currentColumns,
} = useColumnSelection({
  allColumnsData: demoProps,
  initialColumns: demoProps.defaultColumns,
});

const {
  currentColumnSizes,
  onColumnResize,
  onAllColumnsResize,
  updateAvailableWidth: onAvailableWidthUpdate,
} = useColumnResizing({
  currentColumnIndices: currentColumns.indices,
});

const { domains, updateDomains, currentFormatters } = useFormatters({
  allColumnsData: demoProps,
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
  allColumns: demoProps,
});

const {
  groupData,
  groupColumnKey,
  groupHash,
  currentGroup,
  groupTitles,
  onGroupUpdate,
} = useGroups({
  columnData: demoProps,
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
    allData: generateAllData(props.allDataLength),
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

const dataConfig = computed(() => {
  let dataConfig = {
    columnConfigs: [],
    rowConfig: {
      compactMode: props.compactMode,
      enableResizing: props.enableRowResize,
    },
  };
  currentColumns.keys.value.forEach((key, ind) => {
    if (!key) {
      return;
    }
    let columnConfig = {
      key,
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
    };
    dataConfig.columnConfigs.push(columnConfig);
  });
  return dataConfig;
});

const groupByConfig = props.withGroupBy
  ? computed(() => ({
      possibleGroups: demoProps.allColumnHeaders.filter(
        (header, colInd) =>
          demoProps.allColumnTypes[demoProps.allColumnKeys[colInd]] ===
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
  showCollapser: props.showCollapser,
  showPopovers: props.showPopovers,
  showColumnFilters: props.withColumnFilters,
  columnFilterInitiallyActive:
    props.withColumnFilters &&
    Boolean(Object.keys(props.initialFilterValues).length),
  showBottomControls: props.showBottomControls,
  subMenuItems: props.showSubMenus ? props.subMenuItems : [],
  groupSubMenuItems: props.showGroupSubMenus ? props.groupSubMenuItems : [],
  enableVirtualScrolling: props.enableVirtualScrolling,
  enableColumnResizing: props.enableColumnResize,
  groupByConfig,
  timeFilterConfig,
  searchConfig,
  columnSelectionConfig,
  sortConfig,
  actionButtonConfig,
  pageConfig,
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
});

const getCellContentSlotName = (columnId) => `cellContent-${columnId}`;
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
    <TableUI
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
    >
      <template
        v-for="col in currentSlottedColumns"
        :key="rowInd + '_' + colInd + '_' + col"
        #[getCellContentSlotName(col)]="{
          data: { row, key, colInd, rowInd },
        } = { data: {} }"
      >
        <span> {{ key }}(index:{{ rowInd }}) = {{ row[colInd] }} </span>
      </template>
      <template #collapserContent>
        <h6>Collapser slot content:</h6>
        <TableUI v-bind="tableProps">
          <template #collapserContent="{ row }">
            <h6>Example collapser slot:</h6>
            <pre>
                {{ JSON.stringify(row, null, 4) }}
              </pre
            >
          </template>
        </TableUI>
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
    </TableUI>
  </div>
</template>

<style>
@import url("webapps-common/ui/css");

:root {
  font-size: 16px;
  line-height: 1.44;
  height: 100vh;
  background-color: var(--knime-porcelain);
}
</style>
