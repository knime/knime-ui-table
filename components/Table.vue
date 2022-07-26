<script>
import Vue from 'vue';
import TableUI from './TableUI';

import { columnTypes, typeFormatters, tablePageSizes, defaultPageSize } from '../config/table.config';
import { defaultTimeFilter } from '../config/time.config';

import getColumnDomains from '../util/getColumnDomains';
import { getFilterConfigs, getDefaultFilterValues } from '../util/getFilterConfigs';
import { getNextPage } from '../util/getNextPage';
import { getProcessedRowInd } from '../util/processSelection';
import { filter } from '../util/transform/filter';
import { group } from '../util/transform/group';
import { sort } from '../util/transform/sort';
import { paginate } from '../util/transform/paginate';

const MIN_COLUMN_SIZE = 30;
const RESERVED_BODY_WIDTH = 165;

/**
 * @see README.md
 *
 * @todo WEBP-590: Add README.md + docs/demo.
 * @todo WEBP-591: Split into multiple files.
 */
export default {
    components: {
        TableUI
    },
    props: {
        /**
         * Data props.
         */
        allData: {
            type: Array,
            default: () => []
        },
        allColumnHeaders: {
            type: Array,
            default: () => []
        },
        allColumnKeys: {
            type: Array,
            default: () => []
        },
        allColumnTypes: {
            type: [Array, Object],
            default: () => []
        },
        allFormatters: {
            type: Object,
            default: () => ({})
        },
        allClassGenerators: {
            type: Object,
            default: () => ({})
        },
        allSlottedColumns: {
            type: Array,
            default: () => null
        },
        allPopoverRenderers: {
            type: Object,
            default: () => ({})
        },
        timeFilterKey: {
            type: String,
            default: null
        },
        defaultColumns: {
            type: Array,
            default: () => []
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
        /**
         * Additional configuration options.
         */
        pageSize: {
            type: Number,
            default: defaultPageSize
        },
        parentSelected: {
            type: Array,
            default: () => []
        },
        actionButtonText: {
            type: String,
            default: ''
        },
        actionCallback: {
            type: Function,
            default: () => {}
        },
        subMenuItems: {
            type: Array,
            default: () => []
        },
        groupSubMenuItems: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            // Reference State
            domains: {},
            allGroups: this.allColumnHeaders
                .filter((header, colInd) => this.allColumnTypes[this.allColumnKeys[colInd]] === columnTypes.Nominal),
            // Managed reactivity fields (for partial re-processing w/ low memory penalty)
            filteredDataConfig: null,
            groupedDataConfig: null,
            sortedData: null,
            processedData: null,
            processLevel: null,
            // Control State
            // column selection
            currentAllColumnOrder: this.allColumnKeys.map((item, colInd) => colInd),
            defaultColumnSize: MIN_COLUMN_SIZE,
            currentAllColumnSizes: Array(this.allColumnKeys.length).fill(-1),
            currentColumns: this.defaultColumns.map(col => this.allColumnKeys.indexOf(col))
                .filter(ind => ind > -1).sort((a, b) => a > b),
            // time filter
            currentTimeFilter: this.timeFilterKey ? defaultTimeFilter : null,
            // group-by
            currentGroup: null,
            groupTitles: [],
            // search
            searchQuery: '',
            // pagination
            totalTableSize: this.allData.length,
            currentPage: 1,
            currentPageSize: this.pageSize,
            currentTableSize: 0,
            pageRowCount: 0,
            // column sort
            columnSort: 0,
            columnSortDirection: -1,
            // column filter
            showFilter: false,
            filterValues: getDefaultFilterValues(this.allColumnKeys, this.allColumnTypes),
            // Selection State
            processedIndicies: [],
            masterSelected: (() => {
                let initSelected = this.allData.map(item => 0);
                if (this.parentSelected?.length) {
                    this.parentSelected.forEach(rowInd => {
                        initSelected[rowInd] = 1;
                    });
                }
                return initSelected;
            })()
        };
    },
    computed: {
        currentSelection() {
            return this.processedIndicies?.map((group, groupInd) => group.map(
                rowInd => Boolean(this.masterSelected[this.getProcessedRowIndex(rowInd, groupInd)])
            ));
        },
        totalSelected() {
            return this.masterSelected?.reduce((count, isSelected) => count + isSelected, 0);
        },
        dataConfig() {
            let dataConfig = {
                columnConfigs: []
            };
            this.currentColumnKeys.forEach((key, ind) => {
                if (!key) {
                    return;
                }
                let columnType = this.currentColumnTypes[ind];
                let columnConfig = {
                    key,
                    header: this.currentHeaders[ind],
                    type: columnType,
                    size: this.currentColumnSizes[ind],
                    filterConfig: this.currentFilterConfigs[ind],
                    formatter: this.currentFormatters[ind],
                    classGenerator: this.currentClassGenerators[ind] || [],
                    popoverRenderer: this.allPopoverRenderers[key],
                    hasSlotContent: this.currentSlottedColumns?.includes(key)
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
                showBottomControls: this.showBottomControls,
                subMenuItems: this.subMenuItems,
                groupSubMenuItems: this.groupSubMenuItems,
                pageConfig: {
                    tableSize: this.totalTableSize,
                    currentSize: this.currentTableSize,
                    pageSize: this.currentPageSize,
                    possiblePageSizes: tablePageSizes,
                    currentPage: this.currentPage
                }
            };
            if (this.showTimeFilter && this.timeFilterKey) {
                tableConfig.timeFilterConfig = {
                    currentTimeFilter: this.currentTimeFilter
                };
            }
            if (this.showSearch) {
                tableConfig.searchConfig = {
                    searchQuery: this.searchQuery
                };
            }
            if (this.showColumnSelection) {
                tableConfig.columnSelectionConfig = {
                    possibleColumns: this.allHeadersOrdered,
                    currentColumns: this.currentHeaders
                };
            }
            if (this.showGroupBy) {
                tableConfig.groupByConfig = {
                    possibleGroups: this.allGroups,
                    currentGroup: this.currentGroup,
                    currentGroupValues: this.groupTitles
                };
            }
            if (this.showSorting) {
                tableConfig.sortConfig = {
                    sortColumn: this.columnSort,
                    sortDirection: this.columnSortDirection
                };
            }
            if (this.showActionButton) {
                tableConfig.actionButtonConfig = {
                    text: this.actionButtonText,
                    callback: this.actionCallback
                };
            }
            return tableConfig;
        },
        /*
         * Tracks changes in column order by Header value.
         */
        allHeadersOrdered() {
            return this.currentAllColumnOrder.map(colInd => this.allColumnHeaders[colInd]);
        },
        defaultFormatters() {
            return this.allColumnKeys.reduce((formatters, colKey) => {
                formatters[colKey] = this.allFormatters[colKey] ||
                    typeFormatters[this.allColumnTypes[colKey]] ||
                    (item => item);
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
            return this.filterByColumn(this.currentAllColumnSizes).map(s => s > 0 ? s : this.defaultColumnSize);
        },
        currentColumnTypes() {
            return this.filterByColumn(Object.values(this.allColumnTypes));
        },
        currentFormatters() {
            return this.currentColumnKeys.map(colKey => this.defaultFormatters[colKey]);
        },
        currentClassGenerators() {
            return this.currentColumnKeys.map(colKey => this.allClassGenerators[colKey] || []);
        },
        currentSlottedColumns() {
            return this.currentColumnKeys
                .map(col => this.allSlottedColumns?.includes(col) ? col : null)
                .filter(col => col !== null);
        },
        currentFilterConfigs() {
            return getFilterConfigs({
                domains: this.domains,
                columns: this.currentColumnKeys,
                types: this.allColumnTypes,
                values: this.filterValues
            });
        },
        /*
         * Column key of the current group-by column.
         */
        groupColumnKey() {
            return this.allColumnKeys[this.allColumnHeaders.indexOf(this.currentGroup)];
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
                currentColumnKeys: this.currentColumnKeys
            };
        },
        groupHash() {
            return {
                currentGroup: this.currentGroup
            };
        },
        sortHash() {
            return {
                columnSort: this.columnSort,
                columnSortDirection: this.columnSortDirection
            };
        },
        pageHash() {
            return {
                currentPage: this.currentPage,
                currentPageSize: this.currentPageSize
            };
        }
    },
    watch: {
        pageRowCount(newCount) {
            if (newCount === 0) {
                this.onPageSizeUpdate(this.currentPageSize);
            }
        },
        processedData(newProcessedData) {
            consola.trace('New processed data (watcher called).');
            this.pageRowCount = newProcessedData.reduce((count, groupData) => groupData.length + count, 0);
        },
        /*
         * Managed reactivity watchers.
         */
        allData: {
            handler(newData) {
                consola.trace('New parent data (watcher called).');
                this.onAllDataUpdate(newData);
                if (this.processLevel === null || this.processLevel > 1) {
                    this.processLevel = 1;
                    Vue.set(this, 'processedData', this.filterLevelUpdate());
                    this.processLevel = null;
                } else {
                    consola.trace('Blocked unnecessary filter reactivity.');
                }
            },
            deep: true
        },
        filterHash: {
            handler(newHash, oldHash) {
                consola.trace('New filter hash (watcher called).');
                let x = Object.keys(newHash).filter(changeKey => oldHash[changeKey] !== newHash[changeKey]) || [];
                let shouldUpdate = x.length === 1 ? x[0] !== 'showKey' : x.length;
                let isBlocked = this.processLevel !== null && this.processLevel <= 1;
                if (shouldUpdate && !isBlocked) {
                    this.processLevel = 1;
                    Vue.set(this, 'processedData', this.filterLevelUpdate());
                    this.processLevel = null;
                } else {
                    consola.trace('Blocked unnecessary filter reactivity.');
                }
            },
            deep: true
        },
        groupHash: {
            handler() {
                consola.trace('New group hash (watcher called).');
                if (this.processLevel === null || this.processLevel > 2) {
                    this.processLevel = 2;
                    this.processedData = this.groupLevelUpdate();
                    this.processLevel = null;
                } else {
                    consola.trace('Blocked unnecessary group reactivity.');
                }
            },
            deep: true
        },
        sortHash: {
            handler() {
                consola.trace('New sort hash (watcher called).');
                // eslint-disable-next-line no-magic-numbers
                if (this.processLevel === null || this.processLevel > 3) {
                    this.processLevel = 3;
                    this.processedData = this.sortLevelUpdate();
                    this.processLevel = null;
                } else {
                    consola.trace('Blocked unnecessary sort reactivity.');
                }
            },
            deep: true
        },
        pageHash: {
            handler() {
                consola.debug('New page hash (watcher called).');
                // eslint-disable-next-line no-magic-numbers
                if (this.processLevel === null || this.processLevel > 4) {
                    this.processLevel = 4;
                    this.processedData = this.sortLevelUpdate();
                    this.processLevel = null;
                } else {
                    consola.debug('Blocked unnecessary page reactivity.');
                }
            },
            deep: true
        }
    },
    mounted() {
        // If reactivity partially updates on the initial load, update the state manually.
        if (this.allData?.length && this.processedData === null) {
            this.domains = this.getDomains();
            this.processedData = this.filterLevelUpdate();
        }
        // determine default column size on mounted, since only then do we know the clientWidth of this element
        this.updateDefaultColumnSize();
        window.addEventListener('resize', this.updateDefaultColumnSize);
    },
    unmounted() {
        window.removeEventListener('resize', this.updateDefaultColumnSize);
    },
    methods: {
        /*
         * Managed reactivity methods.
         */
        getDomains() {
            return getColumnDomains({
                data: this.allData,
                formatters: this.defaultFormatters,
                types: this.allColumnTypes
            });
        },
        filterLevelUpdate() {
            consola.trace('Filter level update.');
            return this.paginateData(this.sortData(this.groupData(this.filterData())));
        },
        groupLevelUpdate() {
            consola.trace('Group level update.');
            return this.paginateData(this.sortData(this.groupData(this.filteredDataConfig)));
        },
        sortLevelUpdate() {
            consola.trace('Sort level update.');
            return this.paginateData(this.sortData(this.groupedDataConfig));
        },
        pageLevelUpdate() {
            consola.trace('Page level update.');
            return this.paginateData(this.sortedData);
        },
        onAllDataUpdate(newData) {
            this.domains = this.getDomains();
            if (this.totalTableSize !== newData?.length) {
                this.totalTableSize = this.allData.length;
            }
        },
        /*
         * Partial re-processing methods.
         */
        filterData() {
            consola.trace('Filtering data.');
            // declare locally to avoid asynchronous behavior
            let x = filter({
                data: this.allData,
                filterValues: this.filterValues,
                timeFilter: this.currentTimeFilter,
                timeFilterKey: this.timeFilterKey,
                searchQuery: this.searchQuery,
                showFilter: this.showFilter,
                columnKeys: this.currentColumnKeys,
                formatters: this.currentFormatters,
                types: this.allColumnTypes
            });
            this.filteredDataConfig = x;
            this.currentTableSize = x.filteredData.length;
            return x;
        },
        groupData({ filteredData, filteredIndicies }) {
            consola.trace('Grouping data.');
            // declare locally to avoid asynchronous behavior
            let x = group({
                filteredData,
                filteredIndicies,
                groupColumn: this.currentGroup,
                groupColumnKey: this.groupColumnKey
            });
            this.groupedDataConfig = x;
            this.groupTitles = x.groupTitles;
            return x;
        },
        sortData({ groupedData, groupedIndicies }) {
            consola.trace('Sorting data.');
            // declare locally to avoid asynchronous behavior
            let { sortedIndicies, sortedData } = sort({
                groupedData,
                groupedIndicies,
                groupColumnKey: this.groupColumnKey,
                columnKeys: this.currentColumnKeys,
                columnTypes: this.currentColumnTypes,
                sortColumn: this.columnSort,
                sortDirection: this.columnSortDirection
            });
            this.sortedData = sortedData;
            this.processedIndicies = sortedIndicies;
            return sortedData;
        },
        paginateData(sortedData) {
            consola.trace('Paginating data.');
            return paginate({
                sortedData,
                pageSize: this.currentPageSize,
                pageStart: this.pageStart,
                pageEnd: this.pageEnd
            });
        },
        /*
         *
         * Utilities.
         *
         */
        filterByColumn(localData) {
            return localData?.length ? this.currentColumns.map(colInd => localData[colInd]).filter(item => item) : [];
        },
        getProcessedRowIndex(relativeInd, groupInd) {
            return getProcessedRowInd({
                relativeInd,
                groupInd,
                currentPage: this.currentPage,
                currentPageSize: this.currentPageSize,
                currentGroup: this.currentGroup,
                processedIndicies: this.processedIndicies
            });
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
            let x = newColumnList.map(col => this.allHeadersOrdered.indexOf(col)).sort((a, b) => a - b);
            this.currentColumns = x.map(colInd => this.currentAllColumnOrder[colInd]);
        },
        onColumnReorder(colInd, newColInd) {
            consola.debug(`Table received: columnReorder ${colInd} ${newColInd}`);
            let trueColumnInd = this.currentAllColumnOrder[colInd];
            let newAllColumns = this.currentAllColumnOrder.filter(col => col !== trueColumnInd);
            newAllColumns.splice(newColInd, 0, trueColumnInd);
            this.currentAllColumnOrder = newAllColumns;
            if (this.currentColumns.includes(trueColumnInd)) {
                let tempCurrentColumns = this.currentAllColumnOrder
                    .filter(orderedColInd => this.currentColumns.includes(orderedColInd));
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
            let isWithinRange = (proposedPage * this.currentPageSize - this.currentTableSize) < this.currentPageSize;
            if (proposedPage > 0 && isWithinRange) {
                this.currentPage = proposedPage;
            }
        },
        onPageSizeUpdate(newPageSize) {
            consola.debug(`Table received: pageSizeUpdate ${newPageSize}`);
            this.currentPageSize = newPageSize;
            let newPageNumber =
                getNextPage(this.currentPageSize, this.currentPage, this.currentTableSize, this.pageRowCount);
            // only update if changed to avoid unneeded computations
            if (newPageNumber && newPageNumber !== this.currentPage) {
                this.currentPage = newPageNumber;
            }
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
                let ascendingSort = this.columnSortDirection === null || this.columnSortDirection < 0;
                this.columnSortDirection = ascendingSort ? 1 : -1;
            }
        },
        onColumnFilter(colInd, value) {
            consola.debug(`Table received: columnFilter ${colInd} ${value}`);
            let colKey = this.currentColumnKeys[colInd];
            Vue.set(this.filterValues, colKey, value);
        },
        onClearFilter() {
            consola.debug(`Table received: clearFilter`);
            this.filterValues = getDefaultFilterValues(this.allColumnKeys, this.allColumnTypes);
        },
        onToggleFilter(filterActive) {
            consola.debug(`Table received: toggleFilter ${this.filterActive}`);
            this.showFilter = filterActive;
        },
        onSelectAll(selected) {
            consola.debug(`Table received: selectAll ${selected}`);
            this.masterSelected = this.masterSelected.map(item => selected ? 1 : 0);
            this.$emit('tableSelect', this.totalSelected);
        },
        onRowSelect(selected, rowInd, groupInd) {
            consola.debug(
                `Table received: rowSelect ${selected} ${rowInd} ${groupInd} ${this.processedIndicies}`
            );
            Vue.set(
                this.masterSelected,
                this.processedIndicies[groupInd][this.getProcessedRowIndex(rowInd, groupInd)],
                selected ? 1 : 0
            );
            this.$emit('tableSelect', this.totalSelected);
        },
        onTableInput(event) {
            consola.debug(`Table received: tableInput ${event}`);
            this.$emit('tableInput', event);
        },
        onColumnResize(columnIndex, newColumnSize) {
            consola.debug(`Table received: columnResize ${columnIndex} ${newColumnSize}`);
            Vue.set(this.currentAllColumnSizes, this.currentColumns[columnIndex], newColumnSize);
        },
        /*
         *
         * Table methods.
         *
         */
        getSelected() {
            return this.masterSelected
                .map((selected, rowInd) => selected ? rowInd : false)
                .filter(row => row !== false);
        },
        clearSelection() {
            consola.debug(`Table clearing selection.`);
            this.masterSelected = this.allData.map(item => 0);
        },
        updateDefaultColumnSize() {
            this.defaultColumnSize = Math.max(MIN_COLUMN_SIZE,
                (this.$el.clientWidth - RESERVED_BODY_WIDTH) / (this.currentColumns.length || 1));
        }
    }
};
</script>

<template>
  <TableUI
    :data="processedData"
    :current-selection="currentSelection"
    :total-selected="totalSelected"
    :data-config="dataConfig"
    :table-config="tableConfig"
    @timeFilterUpdate="onTimeFilterUpdate"
    @columnUpdate="onColumnUpdate"
    @columnReorder="onColumnReorder"
    @groupUpdate="onGroupUpdate"
    @search="onSearch"
    @pageChange="onPageChange"
    @pageSizeUpdate="onPageSizeUpdate"
    @columnSort="onColumnSort"
    @columnFilter="onColumnFilter"
    @clearFilter="onClearFilter"
    @toggleFilter="onToggleFilter"
    @selectAll="onSelectAll"
    @rowSelect="onRowSelect"
    @tableInput="onTableInput"
    @columnResize="onColumnResize"
  >
    <template
      v-for="col in currentSlottedColumns"
      #[`cellContent-${col}`]="{ data: { row, key, colInd, rowInd } } = { data: {} }"
    >
      <span :key="rowInd + '_' + colInd + '_' + col">
        <slot
          :name="`cellContent-${key}`"
          :data="{ row, key, colInd, rowInd }"
        />
      </span>
    </template>
    <template #collapserContent="{ row }">
      <slot
        name="collapserContent"
        :row="row"
      />
    </template>
    <template #popoverContent="{ data, popoverColumn }">
      <slot
        name="popoverContent"
        :data="data"
        :popoverColumn="popoverColumn"
      />
    </template>
  </TableUI>
</template>
