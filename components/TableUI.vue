<script>
/* eslint-disable max-lines */
import TopControls from './control/TopControls.vue';
import BottomControls from './control/BottomControls.vue';
import ColumnFilters from './filter/ColumnFilters.vue';
import Header from './layout/Header.vue';
import Group from './layout/Group.vue';
import Row from './layout/Row.vue';
import ActionButton from './ui/ActionButton.vue';
import TablePopover from './popover/TablePopover.vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { SPECIAL_COLUMNS_SIZE, DEFAULT_ROW_HEIGHT, DATA_COLUMNS_MARGIN, COMPACT_ROW_HEIGHT,
    HEADER_HEIGHT, ROW_MARGIN_BOTTOM } from '../util/constants';

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
        ActionButton,
        TablePopover,
        RecycleScroller
    },
    props: {
        /**
         * Data props.
         */
        data: {
            type: Array,
            default: () => []
        },
        currentSelection: {
            type: Array,
            default: () => []
        },
        numRowsAbove: {
            type: Number,
            default: 0
        },
        numRowsBelow: {
            type: Number,
            default: 0
        },
        totalSelected: {
            type: Number,
            default: 0
        },
        /**
         * Config props.
         */
        dataConfig: {
            type: Object,
            default: () => ({})
        },
        tableConfig: {
            type: Object,
            default: () => ({}),
            validate(tableConfig) {
                if (typeof tableConfig !== 'object') {
                    return false;
                }
                const requiredProperties = ['showSelection', 'showCollapser', 'showPopovers', 'showColumnFilters',
                    'showBottomControls', 'subMenuItems', 'groupSubMenuItems'];
                let isValid = requiredProperties.every(key => tableConfig.hasOwnProperty(key));
                const requiredConfigs = {
                    pageConfig: [
                        'currentSize',
                        'tableSize',
                        'pageSize',
                        'possiblePageSizes',
                        'currentPage'
                    ],
                    searchConfig: ['searchQuery'],
                    timeFilterConfig: ['currentTimeFilter'],
                    columnSelectionConfig: ['possibleColumns', 'currentColumns'],
                    groupByConfig: ['possibleGroups', 'currentGroup'],
                    sortConfig: ['sortColumn', 'sortDirection'],
                    actionButtonConfig: ['text', 'callback']
                };
                return isValid && Object.entries(requiredConfigs).every((key, values) => {
                    if (tableConfig[key]) {
                        return values.every(configOption => tableConfig[key].hasOwnProperty(configOption));
                    }
                    return true;
                });
            }
        }
    },
    data() {
        return {
            filterActive: this.tableConfig.columnFilterInitiallyActive || false,
            popoverTarget: null,
            popoverData: null,
            popoverColumn: null,
            popoverRenderer: null,
            // the index of the column that is currently being resized and for which a border should be shown
            showBorderColumnIndex: null,
            lastScrollIndex: 0,
            newVal: null,
            scrollerKey: 0,
            resizeCount: 0,
            updatedBefore: false,
            currentExpanded: new Set(),
            rowMarginBottom: ROW_MARGIN_BOTTOM
        };
    },
    computed: {
        /*
         * Current table config. E.g. if 4/10 columns displayed, 'current' fields return values w/ length 4.
         */
        columnHeaders() {
            return this.getPropertiesFromColumns('header');
        },
        columnSubHeaders() {
            return this.getPropertiesFromColumns('subHeader');
        },
        columnSizes() {
            return this.getPropertiesFromColumns('size');
        },
        columnTypes() {
            return this.getPropertiesFromColumns('type');
        },
        columnFilterConfigs() {
            return this.getPropertiesFromColumns('filterConfig');
        },
        columnKeys() {
            return this.getPropertiesFromColumns('key');
        },
        columnSortConfigs() {
            return this.dataConfig.columnConfigs.map(columnConfig => columnConfig.hasOwnProperty('isSortable')
                ? columnConfig.isSortable
                : true);
        },
        slottedColumns() {
            return this.getPropertiesFromColumns('hasSlotContent')
                .map((hasSlotContent, colInd) => hasSlotContent ? colInd : null)
                .filter(colInd => colInd !== null);
        },
        popoverRenderers() {
            return this.getPropertiesFromColumns('popoverRenderer').map((renderer, colInd) => {
                if (renderer && typeof renderer === 'boolean') {
                    renderer = this.columnTypes[colInd];
                }
                return renderer;
            });
        },
        tableHeaderClass() {
            return `table-header${
                this.tableConfig.subMenuItems?.length && !this.tableConfig.showColumnFilters ? ' sub-menu-active' : ''
            }`;
        },
        currentBodyWidth() {
            const widthContentColumns = this.columnSizes.reduce((prev, curr) => prev + curr + DATA_COLUMNS_MARGIN, 0);
            return (this.tableConfig.showSelection ? SPECIAL_COLUMNS_SIZE : 0) +
                (this.tableConfig.showCollapser ? SPECIAL_COLUMNS_SIZE : 0) +
                widthContentColumns + (this.tableConfig.showColumnFilters ? SPECIAL_COLUMNS_SIZE : 0);
        },
        enableVirtualScrolling() {
            return this.tableConfig.enableVirtualScrolling;
        },
        scrollData() {
            const data = this.data?.map(groupData => groupData.map(
                (rowData, index) => ({ id: (index + this.numRowsAbove).toString(), data: rowData, size: this.scrollerItemSize, index: (index + this.numRowsAbove) })
            ));
            this.currentExpanded.forEach((index) => {
                const contentHeight = this.getContentHeight(index);
                data[0][index - this.numRowsAbove].size += contentHeight;
            });
            return data;
        },
        currentSelectionMap() {
          return (index) => (this.currentSelection[0] === null || index < this.numRowsAbove || index >= this.numRowsAbove + this.currentSelection[0].length) ?
                  false :
                  this.currentSelection[0][index - this.numRowsAbove]
        },
        rowHeight() {
            return this.dataConfig.rowConfig.compactMode
                ? COMPACT_ROW_HEIGHT
                : this.dataConfig.rowConfig?.rowHeight || DEFAULT_ROW_HEIGHT;
        },
        scrollerItemSize() {
            // The virtual scroller does not support margins, hence we need to set a different height for the rows
            // instead
            return this.rowHeight + ROW_MARGIN_BOTTOM;
        },
        fixHeader() {
            if (this.enableVirtualScrolling) {
                return true;
            }
            const fixHeaderParam = this.tableConfig.pageConfig?.fixHeader;
            return Boolean(fixHeaderParam);
        },
        currentBodyHeight() {
            let numberOfGroups = 0; let numberOfRows = 0;
            if (this.data) {
                for (const dataGroup of this.data) {
                    if (dataGroup.length > 0) {
                        numberOfGroups++;
                        numberOfRows += dataGroup.length;
                    }
                }
            }
            let numberOfDisplayedRows = numberOfRows;
            const visibleSizeParam = this.tableConfig.pageConfig.visibleSize;
            if (typeof visibleSizeParam !== 'undefined' && visibleSizeParam < numberOfDisplayedRows) {
                numberOfDisplayedRows = visibleSizeParam;
            }
            return this.scrollerItemSize * numberOfDisplayedRows +
            (this.tableConfig.groupByConfig?.currentGroup ? numberOfGroups * HEADER_HEIGHT : 0);
        },
        currentTableHeight() {
            return HEADER_HEIGHT + this.currentBodyHeight;
        }
    },
    watch: {
        'tableConfig.showColumnFilters': {
            handler(newVal) {
                if (!newVal && this.filterActive) {
                    this.onToggleFilter();
                    this.onClearFilter();
                }
            }
        }
    },
    methods: {
        // Utilities
        getPropertiesFromColumns(key) {
            return this.dataConfig.columnConfigs.map(colConfig => colConfig[key]);
        },
        getGroupName(ind) {
            return this.tableConfig.groupByConfig?.currentGroupValues?.[ind] || '';
        },
        refreshScroller() {
            this.scrollerKey++;
        },
        // Event handling
        onScroll(startIndex, endIndex) {
            if (this.lastScrollIndex === endIndex) {
                return;
            }
            const direction = this.lastScrollIndex < endIndex ? 1 : -1;
            this.lastScrollIndex = endIndex;
            this.collapseAllUnusedRows(startIndex, endIndex);
            this.$emit('lazyload', { direction, startIndex, endIndex });
        },
        collapseAllUnusedRows(startIndex, endIndex) {
            let needsCollapse = false;
            const usedExpanded = new Set();
            this.currentExpanded.forEach(i => {
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
        onTimeFilterUpdate(newTimeFilter) {
            consola.debug(`TableUI emitting: timeFilterUpdate ${newTimeFilter}`);
            this.$emit('timeFilterUpdate', newTimeFilter);
        },
        onColumnUpdate(newColumnList) {
            consola.debug(`TableUI emitting: columnUpdate ${newColumnList}`);
            this.$emit('columnUpdate', newColumnList);
        },
        onColumnReorder(colInd, newColInd) {
            consola.debug(`TableUI emitting: columnReorder ${colInd} ${newColInd}`);
            this.$emit('columnReorder', colInd, newColInd);
        },
        onGroupUpdate(group) {
            consola.debug(`TableUI emitting: groupUpdate ${group}`);
            this.$emit('groupUpdate', group);
        },
        onSearch(input) {
            consola.debug(`TableUI emitting: search ${input}`);
            this.$emit('search', input);
        },
        onPageChange(pageNumberDiff) {
            consola.debug(`TableUI emitting: pageChange ${pageNumberDiff}`);
            this.$emit('pageChange', pageNumberDiff);
        },
        onPageSizeUpdate(newPageSize) {
            consola.debug(`TableUI emitting: pageSizeUpdate ${newPageSize}`);
            this.$emit('pageSizeUpdate', newPageSize);
        },
        onColumnSort(colInd) {
            consola.debug(`TableUI emitting: columnSort ${colInd}`);
            this.$emit('columnSort', colInd);
        },
        onColumnFilter(colInd, value) {
            consola.debug(`TableUI emitting: columnFilter ${colInd} ${value}`);
            this.$emit('columnFilter', colInd, value);
        },
        onClearFilter() {
            consola.debug(`TableUI emitting: clearFilter`);
            this.$emit('clearFilter');
        },
        onToggleFilter() {
            this.filterActive = !this.filterActive;
            consola.debug(`TableUI emitting: toggleFilter ${this.filterActive}`);
            this.$emit('toggleFilter', this.filterActive);
        },
        onSelectAll(selected) {
            consola.debug(`TableUI emitting: selectAll ${selected}`);
            this.$emit('selectAll', selected);
        },
        onRowSelect(selected, rowInd, groupInd) {
            consola.debug(`TableUI emitting: rowSelect ${selected} ${rowInd} ${groupInd}`);
            this.$emit('rowSelect', selected, rowInd - this.numRowsAbove, groupInd);
        },
        onRowExpand(expanded, index) {
            if (expanded) {
                this.currentExpanded.add(index);
            } else {
                this.currentExpanded.delete(index);
            }
            // We need to change the reference of this.currentExpanded so that this.scrollerData gets recomputed.
            this.currentExpanded = new Set(this.currentExpanded);
        },
        onRowInput(event) {
            consola.debug(`TableUI emitting: tableInput ${event}`);
            this.$emit('tableInput', event);
            this.openPopover(event);
        },
        onGroupSubMenuClick(event, group) {
            consola.debug(`TableUI group submenu clicked ${event} ${group}`);
            event.callback(group, this);
        },
        onRowSubMenuClick(event, row) {
            consola.debug(`TableUI row submenu clicked ${event} ${row}`);
            event.callback(row, this);
        },
        openPopover(event) {
            consola.debug(`TableUI: open popover`, event);
            this.popoverColumn = this.columnKeys[event.colInd];
            this.popoverRenderer = this.popoverRenderers[event.colInd] || this.columnTypes[event.colInd];
            this.popoverData = this.data[event.groupInd][event.rowInd][this.popoverColumn];
            this.popoverTarget = event.cell;
            window.addEventListener('resize', this.onPopoverClose);
        },
        onPopoverClose() {
            consola.debug(`TableUI: close popover`);
            this.popoverTarget = null;
            this.popoverColumn = null;
            this.popoverRenderer = null;
            this.popoverData = null;
            window.removeEventListener('resize', this.onPopoverClose);
        },
        onColumnResize(columnIndex, newColumnSize) {
            this.$emit('columnResize', columnIndex, newColumnSize);
        },
        // Find the additional height added by expanded content of a row
        getContentHeight(index) {
            // The second child of the dom element referenced by the row is the expanded content.
            const contentHeight = this.$refs[`row-${index}`].map((component) => component.$el.children[1]?.clientHeight)
                .find(height => typeof height !== 'undefined');
            return contentHeight || 0;
        }
    }
};
</script>

<template>
  <div
    class="wrapper"
    :class="{'fix-header': fixHeader}"
  >
    <table
      ref="table"
      class="table"
      :style="{ width: `${currentBodyWidth}px` }"
    >
      <TopControls
        :table-config="tableConfig"
        :column-headers="columnHeaders"
        :style="{ width: `${currentBodyWidth}px` }"
        @nextPage="onPageChange(1)"
        @prevPage="onPageChange(-1)"
        @columnUpdate="onColumnUpdate"
        @columnReorder="onColumnReorder"
        @groupUpdate="onGroupUpdate"
        @searchUpdate="onSearch"
        @timeFilterUpdate="onTimeFilterUpdate"
      />
      <Header
        :table-config="tableConfig"
        :column-headers="columnHeaders"
        :column-sub-headers="columnSubHeaders"
        :column-sizes="columnSizes"
        :column-sort-configs="columnSortConfigs"
        :is-selected="totalSelected > 0"
        :filters-active="filterActive"
        :current-table-height="currentTableHeight"
        :class="tableHeaderClass"
        :style="{ width: `${currentBodyWidth}px` }"
        @headerSelect="onSelectAll"
        @columnSort="onColumnSort"
        @toggleFilter="onToggleFilter"
        @columnResize="onColumnResize"
      />
      <ColumnFilters
        v-if="filterActive"
        :filter-configs="columnFilterConfigs"
        :column-headers="columnHeaders"
        :column-sizes="columnSizes"
        :types="columnTypes"
        :show-collapser="tableConfig.showCollapser"
        :style="{ width: `${currentBodyWidth}px` }"
        @columnFilter="onColumnFilter"
        @clearFilter="onClearFilter"
      />
      <div
        class="body"
        :style="{ width: `${currentBodyWidth}px`, ...fixHeader && { height: `${currentBodyHeight}px` }}"
      >
        <Group
          v-for="(dataGroup, groupInd) in scrollData"
          :key="groupInd"
          :title="getGroupName(groupInd)"
          :group-sub-menu-items="tableConfig.groupSubMenuItems"
          :show="data.length > 1 && dataGroup.length > 0"
          @groupSubMenuClick="event => onGroupSubMenuClick(event, dataGroup)"
        >
          <RecycleScroller
            v-if="enableVirtualScrolling && scrollData.length === 1"
            :key="scrollerKey"
            v-slot="{ item }"
            :items="dataGroup"
            :num-items-above="numRowsAbove"
            :num-items-below="numRowsBelow"
            :empty-item="{ data: [], isSelected: false, size: scrollerItemSize, tableConfig: {showCollapser: false, showSelection: false, subMenuItems: [], showPopovers: false} }"
            class="scroller"
            :style="{ height: `${currentBodyHeight}px` }"
            :emit-update="true"
            @update="onScroll"
          >
            <Row
              :key="item.id"
              :ref="`row-${item.id}`"
              :row="columnKeys.map(column => item.data[column])"
              :table-config="item.tableConfig || tableConfig"
              :column-configs="dataConfig.columnConfigs"
              :row-config="dataConfig.rowConfig"
              :row-height="rowHeight"
              :margin-bottom="rowMarginBottom"
              :is-selected="currentSelectionMap(item.index)"
              :show-border-column-index="showBorderColumnIndex"
              @rowSelect="selected => onRowSelect(selected, item.index, 0)"
              @rowExpand="(expanded) => onRowExpand(expanded, item.index)"
              @rowInput="event => onRowInput({ ...event, index: item.index, id: item.data.id, groupInd: 0})"
              @rowSubMenuClick="event => onRowSubMenuClick(event, item.data)"
            >
              <!-- Vue requires named slots on "custom" elements (i.e. template). -->
              <template
                v-for="colInd in slottedColumns"
                #[`cellContent-${columnKeys[colInd]}`]="cellData"
              >
                <!-- Vue requires key on real element for dynamic scoped slots
                    to help Vue framework manage events. -->
                <span :key="item.index + '_' + colInd">
                  <slot
                    :name="`cellContent-${columnKeys[colInd]}`"
                    :data="{ ...cellData, key: columnKeys[colInd], rowInd: item.index, colInd }"
                  />
                </span>
              </template>
              <template slot="rowCollapserContent">
                <slot
                  name="collapserContent"
                  :row="item"
                />
              </template>
            </Row>
          </RecycleScroller>
          <Row
            v-for="(row, rowInd) in dataGroup"
            v-else
            :key="row.data.id"
            :row="columnKeys.map(column => row.data[column])"
            :table-config="tableConfig"
            :column-configs="dataConfig.columnConfigs"
            :row-config="dataConfig.rowConfig"
            :row-height="rowHeight"
            :margin-bottom="rowMarginBottom"
            :is-selected="currentSelection[groupInd][rowInd]"
            @rowSelect="selected => onRowSelect(selected, rowInd, groupInd)"
            @rowInput="event => onRowInput({ ...event, rowInd, id: row.data.id, groupInd})"
            @rowSubMenuClick="event => onRowSubMenuClick(event, row.data)"
          >
            <!-- Vue requires named slots on "custom" elements (i.e. template). -->
            <template
              v-for="colInd in slottedColumns"
              #[`cellContent-${columnKeys[colInd]}`]="cellData"
            >
              <!-- Vue requires key on real element for dynamic scoped slots
                  to help Vue framework manage events. -->
              <span :key="rowInd + '_' + colInd">
                <slot
                  :name="`cellContent-${columnKeys[colInd]}`"
                  :data="{ ...cellData, key: columnKeys[colInd], rowInd, colInd }"
                />
              </span>
            </template>
            <template slot="rowCollapserContent">
              <slot
                name="collapserContent"
                :row="row"
              />
            </template>
          </Row>
        </Group>
      </div>
      <BottomControls
        v-if="tableConfig.showBottomControls"
        :page-config="tableConfig.pageConfig"
        :style="{ width: `${currentBodyWidth}px` }"
        @nextPage="onPageChange(1)"
        @prevPage="onPageChange(-1)"
        @pageSizeUpdate="onPageSizeUpdate"
      />
      <ActionButton
        v-else-if="tableConfig.actionButtonConfig"
        :config="tableConfig.actionButtonConfig"
      />
    </table>
    <TablePopover
      v-if="popoverTarget && (typeof popoverData !== 'undefined')"
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
.scroller {
  overflow-y: auto;
}

.wrapper {
  position: relative;
}

table,
thead,
tbody {
  width: 100%;
}

table {
  font-size: 13px;
  font-weight: 400;
  table-layout: fixed;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  margin-right: auto;

  & .body {
    overflow-y: visible;
    display: block;

    & >>> tbody {
      display: block;
    }

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

.fix-header {
  height: 100%;
  overflow-y: hidden;

  & table {
    height: 100%;
    overflow-y: hidden;

    & .body {
      overflow-y: auto;
      overflow-x: clip;
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
