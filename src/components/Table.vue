<script>
import Vue from 'vue';
import TableControlsTop from './control/TableControlTop';
import TableControlsBottom from './control/TableControlBottom';
import TableColumnFilters from './filter/TableColumnFilter';
import TableHeader from './TableHeader';
import TableGroup from './TableGroup';
import TableRow from './TableRow';
import TableActionButton from './ui/TableActionButton';
import TablePopover from './popover/TablePopover';

import { columnTypes, typeFormatters } from '~/config/table/table.config';
import { defaultTimeFilter } from '~/config/table/time.config';

import { getColumnDomains, getEmptyFilters } from './util/getColumnDomains';
import { getNextPage } from './util/getNextPage';
import { getProcessedRowInd } from './util/processSelection';
import { filter } from './util/transform/filter';
import { group } from './util/transform/group';
import { sort } from './util/transform/sort';
import { paginate } from './util/transform/paginate';

/**
 * @see README.md
 *
 * @todo WEBP-590: Add README.md + docs/demo.
 * @todo WEBP-591: Split into multiple files.
 */
export default {
    components: {
        TableControlsTop,
        TableControlsBottom,
        TableColumnFilters,
        TableHeader,
        TableGroup,
        TableRow,
        TableActionButton,
        TablePopover
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
        allEditableColumns: {
            type: [Object, Array, String],
            default: () => ({})
        },
        allSlottedColumns: {
            type: Array,
            default: () => null
        },
        allPopoverColumns: {
            type: Array,
            default: () => null
        },
        timeFilterKey: {
            type: String,
            default: null
        },
        /**
         * Default props.
         */
        defaultColumns: {
            type: Array,
            default: () => []
        },
        defaultTimeFilter: {
            type: String,
            default: defaultTimeFilter
        },
        /**
         * Visual element configuration props.
         */
        showTimeFilter: {
            type: Boolean,
            default: true
        },
        showColumns: {
            type: Boolean,
            default: true
        },
        showGroups: {
            type: Boolean,
            default: true
        },
        showSearch: {
            type: Boolean,
            default: true
        },
        showColumnFilters: {
            type: Boolean,
            default: true
        },
        showBottomControls: {
            type: Boolean,
            default: true
        },
        showCollapser: {
            type: Boolean,
            default: false
        },
        showSelection: {
            type: Boolean,
            default: true
        },
        showActionButton: {
            type: Boolean,
            default: false
        },
        /**
         * Additional configuration options.
         */
        parentSelected: {
            type: Array,
            default: () => []
        },
        pageSize: {
            type: Number,
            default: 10
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
        },
        popoverRenderers: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            // REFERENCE FIELDS
            allFilterConfigs: getColumnDomains({
                data: this.allData,
                formatters: this.allFormatters,
                types: this.allColumnTypes
            }),
            allGroups: this.allColumnHeaders
                .filter((header, colInd) => this.allColumnTypes[this.allColumnKeys[colInd]] === columnTypes.Nominal),
            defaultFilterValues: getEmptyFilters(this.allColumnKeys, this.allColumnTypes),
            // Managed reactivity fields (for partial re-processing w/ low memory penalty)
            filteredDataConfig: null,
            groupedDataConfig: null,
            sortedData: null,
            processedData: null,
            processLevel: null,
            // UI FIELDS
            // column control
            currentAllColumnOrder: this.allColumnKeys.map((item, colInd) => colInd),
            currentColumns: this.defaultColumns
                .map(col => this.allColumnKeys.indexOf(col)).filter(ind => ind > -1)
                .sort((a, b) => a > b),
            // time filter control
            currentTimeFilter: this.timeFilterKey ? this.defaultTimeFilter : null,
            // group-by control
            currentGroup: null,
            groupTitles: [],
            // search control
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
            filterValues: {},
            // INTERNAL FIELDS
            // column size state
            columnSizes: this.defaultColumns.map(() => 100 / this.defaultColumns.length),
            tableWidth: 100,
            // popover state
            popoverTarget: null,
            popoverData: null,
            popoverColumn: null,
            popoverRenderer: null,
            // selection state
            processedIndicies: [],
            masterSelected: (() => {
                let initSelected = this.allData.map(item => 0);
                if (this.parentSelected && this.parentSelected.length) {
                    this.parentSelected.forEach(rowInd => {
                        initSelected[rowInd] = 1;
                    });
                }
                return initSelected;
            })()
        };
    },
    computed: {
        /*
         * Tracks changes in column order by Header value.
         */
        allHeadersOrdered() {
            return this.currentAllColumnOrder.map(colInd => this.allColumnHeaders[colInd]);
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
        currentColumnTypes() {
            return this.filterByColumn(Object.values(this.allColumnTypes));
        },
        currentFormatters() {
            return this.currentColumnKeys
                .map((colKey, colInd) => this.allFormatters[colKey] ||
                    typeFormatters[this.currentColumnTypes[colInd]] ||
                    (item => item));
        },
        currentClassGenerators() {
            return this.currentColumnKeys.map((colKey, colInd) => this.allClassGenerators[colKey] || []);
        },
        currentEditableColumns() {
            return this.currentColumnKeys.map((colKey, colInd) => this.allEditableColumns[colKey] || null);
        },
        currentSlottedColumns() {
            return this.currentColumnKeys.map((col, colInd) => this.allSlottedColumns?.includes(col) ? colInd : null);
        },
        currentPopoverColumns() {
            return this.currentColumnKeys.map((col, colInd) => this.allPopoverColumns?.includes(col) ? colInd : null);
        },
        currentFilterConfigs() {
            return this.currentColumnKeys.map((col, colInd) => {
                let filterConfig = Object.assign({}, this.allFilterConfigs[col]);
                let defaultFilter = this.defaultFilterValues[col];
                filterConfig.value = this.filterValues[col] || JSON.parse(JSON.stringify(defaultFilter));
                return filterConfig;
            }).filter(config => config.value !== null);
        },
        tableHeaderClass() {
            return `table-header${this.subMenuItems?.length && !this.showColumnFilters ? ' sub-menu-active' : ''}`;
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
        /*
         * General watchers.
         */
        currentColumns(newColumns) {
            // TODO WEBP-588: Improve column sizing.
            // adjust column sizes when displayed columns change.
            this.columnSizes = newColumns.map(() => 100 / newColumns.length);
        },
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
            this.processedData = this.filterLevelUpdate();
        }
        this.$nextTick(() => {
            if (this.$refs.table) {
                this.updateTableWidth();
            }
        });
    },
    methods: {
        /*
         * Managed reactivity methods.
         */
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
            let newColumnDomains = getColumnDomains({
                data: newData,
                formatters: this.allFormatters,
                types: this.allColumnTypes
            });
            if (JSON.stringify(newColumnDomains) !== this.allFilterConfigs) {
                this.allFilterConfigs = newColumnDomains;
            }
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
        createFormItems(valueArr) {
            return valueArr.map(item => ({ text: item, id: item }));
        },
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
            this.currentTimeFilter = newTimeFilter;
            this.currentPage = 1;
        },
        onColumnUpdate(newColumnList) {
            let x = newColumnList.map(col => this.allHeadersOrdered.indexOf(col)).sort((a, b) => a - b);
            this.currentColumns = x.map(colInd => this.currentAllColumnOrder[colInd]);
            this.updateTableWidth();
        },
        onColumnReorder(colInd, newColInd) {
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
            this.currentGroup = group;
            if (group) {
                this.currentPage = 1;
            }
        },
        onSearch(input) {
            this.searchQuery = input || null;
            if (input) {
                this.currentPage = 1;
            }
        },
        onPageChange(pageNumberDiff) {
            let proposedPage = this.currentPage + pageNumberDiff;
            let isWithinRange = (proposedPage * this.currentPageSize - this.currentTableSize) < this.currentPageSize;
            if (proposedPage > 0 && isWithinRange) {
                this.currentPage = proposedPage;
            }
        },
        onPageSizeUpdate(newPageSize) {
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
        onHeaderSort({ type, ind, value }) {
            if (type === 'sort') {
                let isNewColumn = this.columnSort !== ind;
                if (isNewColumn) {
                    this.currentPage = 1;
                    this.columnSort = ind;
                    this.columnSortDirection = -1;
                } else {
                    let ascendingSort = this.columnSortDirection === null || this.columnSortDirection < 0;
                    this.columnSortDirection = ascendingSort ? 1 : -1;
                }
            }
        },
        onToggleFilter() {
            this.showFilter = !this.showFilter;
        },
        /*
         *
         * Column filter methods.
         *
         */
        onHeaderFilter({ colInd, values }) {
            let colKey = this.currentColumnKeys[colInd];
            if (!values || !values.length) {
                Vue.set(this.filterValues, colKey, JSON.parse(JSON.stringify(this.defaultFilterValues[colKey])));
            } else {
                Vue.set(this.filterValues, colKey, values);
                this.currentPage = 1;
            }
        },
        onClearFilter() {
            this.filterValues = {};
        },
        /*
         * Column size methods.
         */
        updateTableWidth() {
            this.tableWidth = this.$refs.table.offsetWidth;
        },
        /*
         *
         * Row methods.
         *
         */
        onRowSelect(selected, isHeader, rowInd, groupInd) {
            // Toggle selection only the filtered data set on header selection
            if (isHeader) {
                // we cannot directly modify the masterSelected field (either reactivity is missed or a Vue error is thrown)
                let local = [...this.masterSelected];
                this.processedIndicies.forEach(indGroup => {
                    // there is a bug with Vue which requires an explicit type check here for the nested array
                    if (indGroup && Array.isArray(indGroup)) {
                        indGroup.forEach(rowInd => {
                            local[rowInd] = selected ? 1 : 0;
                        });
                    }
                });
                this.masterSelected = local;
            } else {
                Vue.set(
                    this.masterSelected,
                    this.processedIndicies[groupInd][this.getProcessedRowIndex(rowInd, groupInd)],
                    selected ? 1 : 0
                );
            }
            this.$emit('tableSelect', rowInd, this.masterSelected.reduce((count, selected) => count + selected, 0));
        },
        onRowInput(event) {
            this.$emit('tableInput', event);
            this.openPopover(event);
        },
        onGroupSubMenuClick(event, group) {
            event.callback(group, this);
        },
        onRowSubMenuClick(event, row) {
            event.callback(row, this);
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
            this.masterSelected = this.allData.map(item => 0);
        },
        openPopover(event) {
            this.popoverColumn = this.currentColumnKeys[event.colInd];
            this.popoverRenderer = this.popoverRenderers[this.currentColumnKeys[event.colInd]] ||
                this.currentColumnTypes[event.colInd];
            this.popoverData = this.processedData[event.groupInd][event.rowInd][this.popoverColumn];
            this.popoverTarget = event.cell;
            window.addEventListener('resize', this.onPopoverClose);
        },
        onPopoverClose() {
            this.popoverTarget = null;
            this.popoverColumn = null;
            this.popoverRenderer = null;
            this.popoverData = null;
            window.removeEventListener('resize', this.onPopoverClose);
        }
    }
};
</script>

<template>
  <div class="wrapper">
    <table
      ref="table"
    >
      <TableControlsTop
        :total-items="totalTableSize"
        :current-items="currentTableSize"
        :page-size="currentPageSize"
        :current-page="currentPage"
        :all-columns="allHeadersOrdered"
        :current-columns="currentHeaders"
        :all-groups="allGroups"
        :current-group="currentGroup"
        :time-filter="currentTimeFilter"
        :search-query="searchQuery"
        :show-time-filter="showTimeFilter"
        :show-columns="showColumns"
        :show-groups="showGroups"
        :show-search="showSearch"
        @nextPage="onPageChange(1)"
        @prevPage="onPageChange(-1)"
        @columnUpdate="onColumnUpdate"
        @columnReorder="onColumnReorder"
        @groupUpdate="onGroupUpdate"
        @searchUpdate="onSearch"
        @timeFilterUpdate="onTimeFilterUpdate"
      />
      <TableHeader
        :row="currentHeaders"
        :column-sort="columnSort"
        :sort-direction="columnSortDirection"
        :column-widths="columnSizes"
        :is-selected="masterSelected.some(item => item === 1)"
        :filters-active="showFilter"
        :show-collapser="showCollapser"
        :show-selection="showSelection"
        :show-column-filters="showColumnFilters"
        :class="tableHeaderClass"
        @rowSelect="onRowSelect"
        @headerSort="onHeaderSort"
        @toggleFilter="onToggleFilter"
      />
      <TableColumnFilters
        v-if="showColumnFilters && showFilter"
        :columns="currentHeaders"
        :column-widths="columnSizes"
        :show-collapser="showCollapser"
        :filter-configs="currentFilterConfigs"
        :types="currentColumnTypes"
        @headerFilter="onHeaderFilter"
        @clearFilter="onClearFilter"
      />
      <TableGroup
        v-for="(dataGroup, groupInd) in processedData"
        :key="groupInd"
        :title="groupTitles[groupInd]"
        :sub-menu-items="groupSubMenuItems"
        :show="processedData.length > 1 && dataGroup.length > 0"
        @groupSubMenuClick="event => onGroupSubMenuClick(event, dataGroup)"
      >
        <TableRow
          v-for="(row, rowInd) in dataGroup"
          :key="row.id"
          :row="currentColumnKeys.map(column => row[column])"
          :column-widths="columnSizes"
          :formatters="currentFormatters"
          :class-generators="currentClassGenerators"
          :editable-columns="currentEditableColumns"
          :slotted-columns="currentSlottedColumns"
          :popover-columns="currentPopoverColumns"
          :is-selected="masterSelected[processedIndicies[groupInd][getProcessedRowIndex(rowInd, groupInd)]] === 1"
          :sub-menu-items="subMenuItems"
          :show-collapser="showCollapser"
          :show-selection="showSelection"
          @rowSelect="(selected, isHeader) => onRowSelect(selected, isHeader, rowInd, groupInd)"
          @rowInput="event => onRowInput({ ...event, rowInd, id: row.id, groupInd })"
          @rowSubMenuClick="event => onRowSubMenuClick(event, row)"
        >
          <template
            v-for="colInd in currentSlottedColumns"
            #[`cellContent${colInd}`]="cellData"
          >
            <!-- Add key for dynamic scoped slots to help Vue framework manage events. -->
            <span :key="rowInd + '_' + colInd">
              <slot
                :name="`cellContent-${currentColumnKeys[colInd]}`"
                :data="{ ...cellData, column: currentColumnKeys[colInd], rowInd }"
              />
            </span>
          </template>
          <template slot="rowCollapserContent">
            <slot
              name="collapserContent"
              :row="row"
            />
          </template>
        </TableRow>
      </TableGroup>
      <TableControlsBottom
        v-if="showBottomControls"
        :total-items="totalTableSize"
        :current-items="currentTableSize"
        :page-size="currentPageSize"
        :current-page="currentPage"
        @nextPage="onPageChange(1)"
        @prevPage="onPageChange(-1)"
        @pageSizeUpdate="onPageSizeUpdate"
      />
      <TableActionButton
        v-if="!showBottomControls && showActionButton"
        :action-button-text="actionButtonText"
        :action-callback="actionCallback"
      />
    </table>
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
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.wrapper {
  position: relative;
}

table {
  font-size: 13px;
  font-weight: 400;
  table-layout: fixed;

  & >>> td > a {
    text-decoration: none;
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
    padding-right: 15px;
  }

  & >>> td:first-child > a {
    padding-left: 15px;
  }
}

table,
thead,
tbody {
  width: 100%;
}

table >>> tr {
  display: flex;

  &:not(:first-child):not(:last-child) {
    padding: 0 5px;
  }
}

.empty-message {
  font-size: 13px;
  line-height: 18px;
}

>>> .more-button { /* standard focus on button interferes when clicked */
  & button:focus {
    color: var(--knime-masala);
    background-color: var(--knime-silver-sand-semi);
  }
}

@media only screen and (max-width: 1180px) {
  table {
    table-layout: fixed;
    width: 100%;

    & th,
    & >>> td > a {
      padding-right: 0;
      padding-left: 5px;
      margin-left: 0;
    }
  }
}

@media only screen and (max-width: 750px) {
  table {
    & >>> .name {
      width: 40%;
      align-items: center;
    }

    & >>> td.name {
      line-height: unset;
      white-space: pre-wrap;

      & a {
        display: -webkit-box;
        -webkit-line-clamp: 2; /* number of lines to show */
        -webkit-box-orient: vertical;
      }
    }

    & >>> .owner {
      width: 30%;
    }

    & >>> .start-date {
      width: 25%;
    }

    & >>> .state {
      width: 5%;

      &::before {
        padding-left: 5px;
      }
    }

    & >>> th.state {
      overflow: visible;
      padding-left: 0;
    }
  }
}
</style>
