<!-- eslint-disable max-lines -->
<script>
import TableUIWithAutoSizeCalculation from "./TableUIWithAutoSizeCalculation.vue";

import {
  columnTypes,
  typeFormatters,
  tablePageSizes,
  defaultPageSize,
} from "@/config/table.config";
import { defaultTimeFilter } from "@/config/time.config";
import getColumnDomains from "@/util/getColumnDomains";
import {
  getFilterConfigs,
  getDefaultFilterValues,
  getInitialFilterValues,
} from "@/util/getFilterConfigs";
import { getNextPage } from "@/util/getNextPage";
import { getProcessedRowInd } from "@/util/processSelection";
import { filter } from "@/util/transform/filter";
import { group } from "@/util/transform/group";
import { sort } from "@/util/transform/sort";
import { paginate } from "@/util/transform/paginate";
import { MIN_COLUMN_SIZE } from "@/util/constants";

/**
 * @see README.md
 *
 * @todo WEBP-590: Add README.md + docs/demo.
 * @todo WEBP-591: Split into multiple files.
 */
export default {
  components: {
    TableUIWithAutoSizeCalculation,
  },
  props: {
    /**
     * Data props.
     */
    allData: {
      type: Array,
      default: () => [],
    },
    allColumnHeaders: {
      type: Array,
      default: () => [],
    },
    allColumnKeys: {
      type: Array,
      default: () => [],
    },
    allColumnTypes: {
      type: [Array, Object],
      default: () => [],
    },
    allFormatters: {
      type: Object,
      default: () => ({}),
    },
    allClassGenerators: {
      type: Object,
      default: () => ({}),
    },
    allSlottedColumns: {
      type: Array,
      default: () => null,
    },
    allPopoverRenderers: {
      type: Object,
      default: () => ({}),
    },
    allColumnSpecificSortConfigs: {
      type: Array,
      default: () => [],
    },
    timeFilterKey: {
      type: String,
      default: null,
    },
    defaultColumns: {
      type: Array,
      default: () => [],
    },
    /**
     * Default sorting
     */
    defaultSortColumn: {
      type: Number,
      default: 0,
    },
    defaultSortColumnDirection: {
      type: Number,
      default: -1,
      validator(value) {
        return value === -1 || value === 1;
      },
    },
    /**
     * Initial filter values applied if showColumnFilters is true
     */
    initialFilterValues: {
      type: Object,
      default: () => ({}),
    },
    /**
     * Visual element configuration props.
     */
    showSorting: Boolean,
    showTimeFilter: Boolean,
    showColumnSelection: Boolean,
    showGroupBy: Boolean,
    showSearch: Boolean,
    showColumnFilters: Boolean,
    showBottomControls: Boolean,
    showCollapser: Boolean,
    showSelection: Boolean,
    showActionButton: Boolean,
    showPopovers: Boolean,
    compactMode: Boolean,
    enableVirtualScrolling: {
      type: Boolean,
      default: false,
    },
    autoSizeColumnsToContent: Boolean,
    autoSizeColumnsToContentInclHeaders: Boolean,
    fixHeader: Boolean,
    /**
     * Additional configuration options.
     */
    pageSize: {
      type: Number,
      default: defaultPageSize,
    },
    parentSelected: {
      type: Array,
      default: () => [],
    },
    actionButtonText: {
      type: String,
      default: "",
    },
    actionCallback: {
      type: Function,
      default: () => {},
    },
    subMenuItems: {
      type: Array,
      default: () => [],
    },
    /**
     * The table automatically shows the subMenu or not
     * if you use table-wide subMenuItems and cares about resizing correctly.
     * If you use custom subMenuItemsForRows in Row.vue, set this to 'always'.
     */
    showSubMenu: {
      type: String,
      default: "auto",
      validate: (val) => ["auto", "always"].includes(val),
    },
    groupSubMenuItems: {
      type: Array,
      default: () => [],
    },
    headerSubMenuItems: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["tableSelect", "tableInput", "headerSubMenuSelect"],
  data() {
    return {
      // Reference State
      domains: {},
      allGroups: this.allColumnHeaders.filter(
        (header, colInd) =>
          this.allColumnTypes[this.allColumnKeys[colInd]] ===
          columnTypes.Nominal,
      ),
      // Managed reactivity fields (for partial re-processing w/ low memory penalty)
      filteredDataConfig: null,
      groupedDataConfig: null,
      sortedData: null,
      paginatedData: null,
      processLevel: null,
      // Control State
      // column selection
      currentAllColumnOrder: this.allColumnKeys.map((item, colInd) => colInd),
      currentAllColumnSizes: Array(this.allColumnKeys.length).fill(-1),
      currentSetDefaultColumnSize: null,
      currentAvailableWidth: 0,
      currentColumns: this.defaultColumns
        .map((col) => this.allColumnKeys.indexOf(col))
        .filter((ind) => ind > -1)
        .sort((a, b) => a > b),
      // time filter
      currentTimeFilter: this.timeFilterKey ? defaultTimeFilter : null,
      // group-by
      currentGroup: null,
      groupTitles: [],
      // search
      searchQuery: "",
      // pagination
      totalTableSize: this.allData.length,
      currentPage: 1,
      currentPageSize: this.pageSize,
      currentTableSize: 0,
      pageRowCount: 0,
      // column sort
      columnSort: this.defaultSortColumn,
      columnSortDirection: this.defaultSortColumnDirection,
      // column filter
      showFilter:
        this.showColumnFilters &&
        Boolean(Object.keys(this.initialFilterValues).length),
      filterValues:
        this.showColumnFilters &&
        Boolean(Object.keys(this.initialFilterValues).length)
          ? getInitialFilterValues(
              this.allColumnKeys,
              this.allColumnTypes,
              this.initialFilterValues,
            )
          : getDefaultFilterValues(this.allColumnKeys, this.allColumnTypes),
      // Selection State
      masterSelected: this.initMasterSelected(),
      processedIndicies: [],
      paginatedIndicies: [],
      processedSelection: [],
      paginatedSelection: [],
    };
  },
  computed: {
    totalSelected() {
      return this.masterSelected?.reduce(
        (count, isSelected) => count + isSelected,
        0,
      );
    },
    dataConfig() {
      let dataConfig = {
        columnConfigs: [],
        rowConfig: {
          compactMode: this.compactMode,
        },
      };
      this.currentColumnKeys.forEach((key, ind) => {
        if (!key) {
          return;
        }
        let columnType = this.currentColumnTypes[ind];
        let columnConfig = {
          // the id is used to keep track of which columns were removed/added in the TableUIForAutoSizeCalc
          id: key,
          // the key is used to get the data of the columns
          key,
          header: this.currentHeaders[ind],
          type: columnType,
          size: this.currentColumnSizes[ind],
          filterConfig: this.currentFilterConfigs[ind],
          formatter: this.currentFormatters[ind],
          classGenerator: this.currentClassGenerators[ind] || [],
          popoverRenderer: this.allPopoverRenderers[key],
          hasSlotContent: this.currentSlottedColumns?.includes(key),
          ...(this.headerSubMenuItems.length > 0 && {
            headerSubMenuItems: this.headerSubMenuItems[ind],
          }),
          ...(this.currentColumnSpecificSortConfigs.length !== 0 && {
            isSortable: this.currentColumnSpecificSortConfigs[ind],
          }),
        };
        dataConfig.columnConfigs.push(columnConfig);
      });
      return dataConfig;
    },
    tableConfig() {
      let tableConfig = {
        showSelection: this.showSelection,
        showCollapser: this.showCollapser,
        showPopovers: this.showPopovers,
        showColumnFilters: this.showColumnFilters,
        columnFilterInitiallyActive:
          this.showColumnFilters &&
          Boolean(Object.keys(this.initialFilterValues).length),
        showBottomControls: this.showBottomControls,
        subMenuItems: this.subMenuItems,
        groupSubMenuItems: this.groupSubMenuItems,
        enableVirtualScrolling: this.enableVirtualScrolling,
        enableColumnResizing: false,
        pageConfig: {
          tableSize: this.totalTableSize,
          currentSize: this.currentTableSize,
          pageSize: this.currentPageSize,
          possiblePageSizes: tablePageSizes,
          currentPage: this.currentPage,
          fixHeader: this.fixHeader,
        },
      };
      if (this.showTimeFilter && this.timeFilterKey) {
        tableConfig.timeFilterConfig = {
          currentTimeFilter: this.currentTimeFilter,
        };
      }
      if (this.showSearch) {
        tableConfig.searchConfig = {
          searchQuery: this.searchQuery,
        };
      }
      if (this.showColumnSelection) {
        tableConfig.columnSelectionConfig = {
          possibleColumns: this.allHeadersOrdered,
          currentColumns: this.currentHeaders,
        };
      }
      if (this.showGroupBy) {
        tableConfig.groupByConfig = {
          possibleGroups: this.allGroups,
          currentGroup: this.currentGroup,
          currentGroupValues: this.groupTitles,
        };
      }
      if (this.showSorting) {
        tableConfig.sortConfig = {
          sortColumn: this.columnSort,
          sortDirection: this.columnSortDirection,
        };
      }
      if (this.showActionButton) {
        tableConfig.actionButtonConfig = {
          text: this.actionButtonText,
          callback: this.actionCallback,
        };
      }
      return tableConfig;
    },
    /*
     * Tracks changes in column order by Header value.
     */
    allHeadersOrdered() {
      return this.currentAllColumnOrder.map(
        (colInd) => this.allColumnHeaders[colInd],
      );
    },
    defaultFormatters() {
      return this.allColumnKeys.reduce((formatters, colKey) => {
        formatters[colKey] =
          this.allFormatters[colKey] ||
          typeFormatters(this.allColumnTypes[colKey]) ||
          ((item) => item);
        return formatters;
      }, {});
    },
    /*
     * Current table config. E.g. if 4/10 columns displayed, 'current' fields return values w/ length 4.
     */
    currentHeaders() {
      return this.filterByColumn(this.allColumnHeaders);
    },
    currentColumnKeys() {
      return this.filterByColumn(this.allColumnKeys);
    },
    currentColumnSizes() {
      const nColumns = this.currentColumns.length;
      if (nColumns < 1) {
        return [];
      }
      const currentDefaultColumnSize =
        this.currentSetDefaultColumnSize ||
        this.currentAvailableWidth / nColumns;
      const defaultColumnSize = Math.max(
        MIN_COLUMN_SIZE,
        currentDefaultColumnSize,
      );
      const currentColumnSizes = this.filterByColumn(
        this.currentAllColumnSizes,
      ).map((columnSize) => (columnSize > 0 ? columnSize : defaultColumnSize));
      const lastColumnMinSize =
        this.currentAvailableWidth -
        currentColumnSizes
          .slice(0, nColumns - 1)
          .reduce((partialSum, size) => partialSum + size, 0);
      currentColumnSizes[nColumns - 1] = Math.max(
        lastColumnMinSize,
        currentColumnSizes[nColumns - 1],
      );
      return currentColumnSizes;
    },
    currentColumnTypes() {
      return this.filterByColumn(Object.values(this.allColumnTypes));
    },
    currentFormatters() {
      return this.currentColumnKeys.map(
        (colKey) => this.defaultFormatters[colKey],
      );
    },
    currentClassGenerators() {
      return this.currentColumnKeys.map(
        (colKey) => this.allClassGenerators[colKey] || [],
      );
    },
    currentSlottedColumns() {
      return this.currentColumnKeys
        .map((col) => (this.allSlottedColumns?.includes(col) ? col : null))
        .filter((col) => col !== null);
    },
    currentFilterConfigs() {
      return getFilterConfigs({
        domains: this.domains,
        columns: this.currentColumnKeys,
        types: this.allColumnTypes,
        values: this.filterValues,
      });
    },
    currentColumnSpecificSortConfigs() {
      return this.getDataOfCurrentlyShownColumns(
        this.allColumnSpecificSortConfigs,
      );
    },
    /*
     * Column key of the current group-by column.
     */
    groupColumnKey() {
      return this.allColumnKeys[
        this.allColumnHeaders.indexOf(this.currentGroup)
      ];
    },
    /*
     * Pagination fields.
     */
    pageStart() {
      return this.currentPageSize * (this.currentPage - 1);
    },
    pageEnd() {
      return this.currentPageSize * this.currentPage;
    },
    /*
     * Managed reactivity fields.
     */
    filterHash() {
      return {
        filterValues: this.filterValues,
        currentFilterConfigs: this.currentFilterConfigs,
        currentTimeFilter: this.currentTimeFilter,
        searchQuery: this.searchQuery,
        showFilter: this.showFilter,
        currentColumnKeys: this.currentColumnKeys,
      };
    },
    groupHash() {
      return {
        currentGroup: this.currentGroup,
      };
    },
    sortHash() {
      return {
        columnSort: this.columnSort,
        columnSortDirection: this.columnSortDirection,
      };
    },
    pageHash() {
      return {
        currentPage: this.currentPage,
        currentPageSize: this.currentPageSize,
      };
    },
    useAutoColumnSizes() {
      return (
        this.autoSizeColumnsToContent ||
        this.autoSizeColumnsToContentInclHeaders
      );
    },
    autoColumnSizesOptions() {
      return {
        fixedSizes: {},
        calculateForBody: this.autoSizeColumnsToContent,
        calculateForHeader: this.autoSizeColumnsToContentInclHeaders,
      };
    },
  },
  watch: {
    pageRowCount(newCount) {
      if (newCount === 0) {
        this.onPageSizeUpdate(this.currentPageSize);
      }
    },
    paginatedData(newPaginatedData) {
      consola.trace("New paginated data (watcher called).");
      this.pageRowCount = newPaginatedData.reduce(
        (count, groupData) => groupData.length + count,
        0,
      );
    },
    /*
     * Managed reactivity watchers.
     */
    allData: {
      handler(newData) {
        consola.trace("New parent data (watcher called).");
        this.onAllDataUpdate(newData);
      },
      deep: true,
    },
    filterHash: {
      handler() {
        consola.trace("New filter hash (watcher called).");
        if (this.processLevel === null || this.processLevel > 1) {
          this.processLevel = 1;
          this.filterLevelUpdate();
          this.processLevel = null;
        } else {
          consola.trace("Blocked unnecessary filter reactivity.");
        }
      },
      deep: true,
    },
    groupHash: {
      handler() {
        consola.trace("New group hash (watcher called).");
        if (this.processLevel === null || this.processLevel > 2) {
          this.processLevel = 2;
          this.groupLevelUpdate();
          this.processLevel = null;
        } else {
          consola.trace("Blocked unnecessary group reactivity.");
        }
      },
      deep: true,
    },
    sortHash: {
      handler() {
        consola.trace("New sort hash (watcher called).");
        // eslint-disable-next-line no-magic-numbers
        if (this.processLevel === null || this.processLevel > 3) {
          this.processLevel = 3;
          this.sortLevelUpdate();
          this.processLevel = null;
        } else {
          consola.trace("Blocked unnecessary sort reactivity.");
        }
      },
      deep: true,
    },
    pageHash: {
      handler() {
        consola.debug("New page hash (watcher called).");
        // eslint-disable-next-line no-magic-numbers
        if (this.processLevel === null || this.processLevel > 4) {
          this.processLevel = 4;
          this.pageLevelUpdate();
          this.processLevel = null;
        } else {
          consola.debug("Blocked unnecessary page reactivity.");
        }
      },
      deep: true,
    },
    masterSelected: {
      handler() {
        consola.debug("New selection (watcher called).");
        this.pageLevelUpdate();
      },
      deep: true,
    },
  },
  mounted() {
    // If reactivity partially updates on the initial load, update the state manually.
    if (this.allData?.length) {
      this.onAllDataUpdate(this.allData);
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    /*
     * Managed reactivity methods.
     */
    getDomains() {
      return getColumnDomains({
        data: this.allData,
        formatters: this.defaultFormatters,
        types: this.allColumnTypes,
      });
    },
    filterLevelUpdate() {
      consola.trace("Filter level update.");
      this.paginateData(this.sortData(this.groupData(this.filterData())));
    },
    groupLevelUpdate() {
      consola.trace("Group level update.");
      this.paginateData(this.sortData(this.groupData(this.filteredDataConfig)));
    },
    sortLevelUpdate() {
      consola.trace("Sort level update.");
      this.paginateData(this.sortData(this.groupedDataConfig));
    },
    pageLevelUpdate() {
      consola.trace("Page level update.");
      this.paginateData(this.sortedData);
    },
    onAllDataUpdate(newData) {
      // Update domains, size and masterSelection before filtering/processing.
      this.domains = this.getDomains();
      if (this.totalTableSize !== newData?.length) {
        this.totalTableSize = this.allData.length;
        this.masterSelected = this.initMasterSelected();
      }
      if (
        this.paginatedData === null ||
        this.processLevel === null ||
        this.processLevel > 1
      ) {
        this.processLevel = 1;
        this.filterLevelUpdate();
        this.processLevel = null;
      } else {
        consola.trace("Blocked unnecessary filter reactivity.");
      }
    },
    /*
     * Partial re-processing methods.
     */
    filterData() {
      consola.trace("Filtering data.");
      // declare locally to avoid asynchronous behavior
      let filteredDataConfig = filter({
        data: this.allData,
        filterValues: this.filterValues,
        timeFilter: this.currentTimeFilter,
        timeFilterKey: this.timeFilterKey,
        searchQuery: this.searchQuery,
        showFilter: this.showFilter,
        columnKeys: this.currentColumnKeys,
        formatters: this.currentFormatters,
        types: this.allColumnTypes,
      });
      this.filteredDataConfig = filteredDataConfig;
      this.currentTableSize = filteredDataConfig.filteredData.length;
      return filteredDataConfig;
    },
    groupData({ filteredData, filteredIndicies }) {
      consola.trace("Grouping data.");
      // declare locally to avoid asynchronous behavior
      let x = group({
        filteredData,
        filteredIndicies,
        groupColumn: this.currentGroup,
        groupColumnKey: this.groupColumnKey,
      });
      this.groupedDataConfig = x;
      this.groupTitles = x.groupTitles;
      return x;
    },
    sortData({ groupedData, groupedIndicies }) {
      consola.trace("Sorting data.");
      // declare locally to avoid asynchronous behavior
      let { sortedIndicies, sortedData } = sort({
        groupedData,
        groupedIndicies,
        groupColumnKey: this.groupColumnKey,
        columnKeys: this.currentColumnKeys,
        columnTypes: this.currentColumnTypes,
        sortColumn: this.columnSort,
        sortDirection: this.columnSortDirection,
      });
      this.sortedData = sortedData;
      this.processedIndicies = sortedIndicies;
      return sortedData;
    },
    paginateData(sortedData) {
      consola.trace("Paginating data.");
      this.processedSelection = this.processedIndicies?.map((group) =>
        group.map((rowInd) => Boolean(this.masterSelected[rowInd])),
      );
      const { paginatedData, paginatedSelection, paginatedIndicies } = paginate(
        {
          sortedData,
          processedIndicies: this.processedIndicies,
          processedSelection: this.processedSelection,
          pageSize: this.currentPageSize,
          pageStart: this.pageStart,
          pageEnd: this.pageEnd,
        },
      );

      this.paginatedData = paginatedData;
      this.paginatedIndicies = paginatedIndicies;
      this.paginatedSelection = paginatedSelection;
    },
    /*
     *
     * Utilities.
     *
     */
    getDataOfCurrentlyShownColumns(localData) {
      return localData?.length
        ? this.currentColumns.map((colInd) => localData[colInd])
        : [];
    },
    filterByColumn(localData) {
      return this.getDataOfCurrentlyShownColumns(localData).filter(
        (item) => item,
      );
    },
    getProcessedRowIndex(relativeInd, groupInd) {
      return getProcessedRowInd({
        relativeInd,
        groupInd,
        currentPage: this.currentPage,
        currentPageSize: this.currentPageSize,
        currentGroup: this.currentGroup,
        processedIndicies: this.processedIndicies,
      });
    },
    initMasterSelected() {
      let initSelected = this.allData.map(() => 0);
      if (this.parentSelected?.length) {
        this.parentSelected.forEach((rowInd) => {
          initSelected[rowInd] = 1;
        });
      }
      return initSelected;
    },
    /*
     *
     * Table control methods.
     *
     */
    onTimeFilterUpdate(newTimeFilter) {
      consola.debug(`Table received: timeFilterUpdate ${newTimeFilter}`);
      this.currentTimeFilter = newTimeFilter;
      this.currentPage = 1;
    },
    onColumnUpdate(newColumnList) {
      consola.debug(`Table received: columnUpdate ${newColumnList}`);
      let x = newColumnList
        .map((col) => this.allHeadersOrdered.indexOf(col))
        .sort((a, b) => a - b);
      this.currentColumns = x.map(
        (colInd) => this.currentAllColumnOrder[colInd],
      );
    },
    onColumnReorder(colInd, newColInd) {
      consola.debug(`Table received: columnReorder ${colInd} ${newColInd}`);
      let trueColumnInd = this.currentAllColumnOrder[colInd];
      let newAllColumns = this.currentAllColumnOrder.filter(
        (col) => col !== trueColumnInd,
      );
      newAllColumns.splice(newColInd, 0, trueColumnInd);
      this.currentAllColumnOrder = newAllColumns;
      if (this.currentColumns.includes(trueColumnInd)) {
        let tempCurrentColumns = this.currentAllColumnOrder.filter(
          (orderedColInd) => this.currentColumns.includes(orderedColInd),
        );
        this.currentColumns = tempCurrentColumns;
      }
    },
    onGroupUpdate(group) {
      consola.debug(`Table received: groupUpdate ${group}`);
      this.currentGroup = group;
      if (group) {
        this.currentPage = 1;
      }
    },
    onSearch(input) {
      consola.debug(`Table received: search ${input}`);
      this.searchQuery = input || null;
      if (input) {
        this.currentPage = 1;
      }
    },
    onPageChange(pageNumberDiff) {
      consola.debug(`Table received: pageChange ${pageNumberDiff}`);
      let proposedPage = this.currentPage + pageNumberDiff;
      let isWithinRange =
        proposedPage * this.currentPageSize - this.currentTableSize <
        this.currentPageSize;
      if (proposedPage > 0 && isWithinRange) {
        this.currentPage = proposedPage;
      }
      this.$refs.tableUIWithAutoSizeCalc.triggerCalculationOfAutoColumnSizes();
    },
    onPageSizeUpdate(newPageSize) {
      consola.debug(`Table received: pageSizeUpdate ${newPageSize}`);
      this.currentPageSize = newPageSize;
      let newPageNumber = getNextPage(
        this.currentPageSize,
        this.currentPage,
        this.currentTableSize,
        this.pageRowCount,
      );
      // only update if changed to avoid unneeded computations
      if (newPageNumber && newPageNumber !== this.currentPage) {
        this.currentPage = newPageNumber;
      }
      this.$refs.tableUIWithAutoSizeCalc.triggerCalculationOfAutoColumnSizes();
    },
    /*
     *
     * Table header methods.
     *
     */
    onColumnSort(colInd) {
      consola.debug(`Table received: columnSort ${colInd}`);
      let isNewColumn = this.columnSort !== colInd;
      if (isNewColumn) {
        this.currentPage = 1;
        this.columnSort = colInd;
        this.columnSortDirection = -1;
      } else {
        let ascendingSort =
          this.columnSortDirection === null || this.columnSortDirection < 0;
        this.columnSortDirection = ascendingSort ? 1 : -1;
      }
    },
    onColumnFilter(colInd, value) {
      consola.debug(`Table received: columnFilter ${colInd} ${value}`);
      let colKey = this.currentColumnKeys[colInd];
      this.filterValues[colKey] = value;
    },
    onClearFilter() {
      consola.debug("Table received: clearFilter");
      this.filterValues = getDefaultFilterValues(
        this.allColumnKeys,
        this.allColumnTypes,
      );
    },
    onToggleFilter(filterActive) {
      consola.debug(`Table received: toggleFilter ${this.filterActive}`);
      this.showFilter = filterActive;
    },
    onSelectAll(selected) {
      consola.debug(`Table received: selectAll ${selected}`);
      const newSelection = this.masterSelected.map((_, i) =>
        selected && this.processedIndicies.some((group) => group.includes(i))
          ? 1
          : 0,
      );
      this.masterSelected = newSelection;
      this.$emit("tableSelect", this.totalSelected);
    },
    onRowSelect(selected, rowInd, groupInd) {
      consola.debug(
        `Table received: rowSelect ${selected} ${rowInd} ${groupInd} ${this.paginatedIndicies}`,
      );
      const masterSelectedIndex = this.paginatedIndicies[groupInd][rowInd];
      this.masterSelected[masterSelectedIndex] = selected ? 1 : 0;
      this.$emit("tableSelect", this.totalSelected);
    },
    onTableInput(event) {
      consola.debug(`Table received: tableInput ${event}`);
      this.$emit("tableInput", event);
    },
    onColumnResize(columnIndex, newColumnSize) {
      consola.debug(
        `Table received: columnResize ${columnIndex} ${newColumnSize}`,
      );
      const resizedColumnIndex = this.currentColumns[columnIndex];
      this.currentAllColumnSizes[resizedColumnIndex] = newColumnSize;
    },
    onAllColumnsResize(newColumnSize) {
      consola.debug(`Table received: allColumnResize ${newColumnSize}`);
      this.currentSetDefaultColumnSize = newColumnSize;
      this.currentAllColumnSizes = Array(this.allColumnKeys.length).fill(-1);
    },
    onHeaderSubMenuItemSelection(item, index) {
      consola.debug(
        `Table received: headerSubMenuItemSelection ${item} ${index}`,
      );
      this.$emit("headerSubMenuSelect", item, index);
    },
    /*
     *
     * Table methods.
     *
     */
    getSelected() {
      return this.masterSelected
        .map((selected, rowInd) => (selected ? rowInd : false))
        .filter((row) => row !== false);
    },
    clearSelection() {
      consola.debug("Table clearing selection.");
      this.masterSelected = this.allData.map(() => 0);
    },
    updateAvailableWidth(newAvailableWidth) {
      if (this.currentAvailableWidth && !this.useAutoColumnSizes) {
        const ratio = newAvailableWidth / this.currentAvailableWidth;
        this.currentAllColumnSizes = this.currentAllColumnSizes.map(
          (columnSize) => (columnSize > 0 ? columnSize * ratio : columnSize),
        );
        if (this.currentSetDefaultColumnSize !== null) {
          this.currentSetDefaultColumnSize *= ratio;
        }
      }
      this.currentAvailableWidth = newAvailableWidth;
    },
    getCellContentSlotName(columnId) {
      // see https://vuejs.org/guide/essentials/template-syntax.html#dynamic-argument-syntax-constraints
      return `cellContent-${columnId}`;
    },
    onAutoColumnSizesUpdate(newAutoColumnSizes) {
      this.allColumnKeys.forEach((columnKey, columnIndex) => {
        this.currentAllColumnSizes[columnIndex] =
          newAutoColumnSizes[columnKey] || -1;
      });
    },
  },
};
</script>

<template>
  <TableUIWithAutoSizeCalculation
    ref="tableUIWithAutoSizeCalc"
    :data="paginatedData"
    :current-selection="paginatedSelection"
    :total-selected="totalSelected"
    :data-config="dataConfig"
    :table-config="tableConfig"
    :auto-column-sizes-options="autoColumnSizesOptions"
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
    @table-input="onTableInput"
    @column-resize="onColumnResize"
    @all-columns-resize="onAllColumnsResize"
    @update:available-width="updateAvailableWidth"
    @header-sub-menu-item-selection="onHeaderSubMenuItemSelection"
    @auto-column-sizes-update="onAutoColumnSizesUpdate"
  >
    <!-- eslint-disable vue/valid-v-slot -->
    <template
      v-for="col in currentSlottedColumns"
      :key="rowInd + '_' + colInd + '_' + col"
      #[getCellContentSlotName(col)]="{ data: { row, key, colInd, rowInd } } = {
        data: {},
      }"
    >
      <span>
        <slot
          :name="`cellContent-${key}`"
          :data="{ row, key, colInd, rowInd }"
        />
      </span>
    </template>
    <template #collapserContent="{ row }">
      <slot name="collapserContent" :row="row" />
    </template>
    <template #popoverContent="{ data, popoverColumn }">
      <slot
        name="popoverContent"
        :data="data"
        :popover-column="popoverColumn"
      />
    </template>
  </TableUIWithAutoSizeCalculation>
</template>
