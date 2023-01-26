<script>
/* eslint-disable max-lines */
import TopControls from './control/TopControls.vue';
import BottomControls from './control/BottomControls.vue';
import ColumnFilters from './filter/ColumnFilters.vue';
import Header from './layout/Header.vue';
import Group from './layout/Group.vue';
import Row from './layout/Row.vue';
import PlaceholderRow from './ui/PlaceholderRow.vue';
import ActionButton from './ui/ActionButton.vue';
import TablePopover from './popover/TablePopover.vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { SPECIAL_COLUMNS_SIZE, DEFAULT_ROW_HEIGHT, DATA_COLUMNS_MARGIN, COMPACT_ROW_HEIGHT,
    HEADER_HEIGHT, ROW_MARGIN_BOTTOM, CONTROLS_HEIGHT } from '@/util/constants';
import getScrollbarWidth from '../util/getScrollbarWidth';

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
        /**
         
         * Only used when tableConfig.enableVirtualScrolling is true.
         * It specifies how many (empty) rows should be simultated above the given rows in this.data[0]
         */
        numRowsAbove: {
            type: Number,
            default: 0
        },
        /**
         * Only used when tableConfig.enableVirtualScrolling is true.
         * It specifies how many (empty) rows should be simultated below the given rows in this.data[0]
         */
        numRowsBelow: {
            type: Number,
            default: 0
        },
        /**
         * Data displayed when scrolling to the bottom of the table. Currently only supproted together
         * with virtual scrolling enabled.
        */
        bottomData: {
            type: Array,
            default: () => []
        },
        /**
         * analogous to currentSelection but for the bottomData
         */
        currentBottomSelection: {
            type: Array,
            default: () => []
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
                    'showBottomControls', 'subMenuItems', 'groupSubMenuItems', 'fitToContainer'];
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
    emits: [
        'timeFilterUpdate',
        'columnUpdate',
        'columnReorder',
        'groupUpdate',
        'search',
        'pageChange',
        'pageSizeUpdate',
        'columnSort',
        'columnFilter',
        'clearFilter',
        'toggleFilter',
        'selectAll',
        'rowSelect',
        'tableInput',
        'columnResize',
        'headerSubMenuItemSelection',
        'lazyload'
    ],
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
            rowMarginBottom: ROW_MARGIN_BOTTOM,
            wrapperHeight: 0,
            wrapperWidth: 0,
            wrapperResizeObserver: new ResizeObserver((entries) => {
                this.wrapperHeight = entries[0].contentRect.height;
                this.wrapperWidth = entries[0].contentRect.width;
            }),
            scrollBarWidth: 0,
            closeExpandedSubMenu: () => {}
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
        columnHeaderSubMenuItems() {
            return this.getPropertiesFromColumns('headerSubMenuItems');
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
        fitToContainer() {
            return this.tableConfig.fitToContainer;
        },
        topDataLength() {
            if (this.data === null) {
                return 0;
            }
            return this.data[0].length;
        },
        scrollData() {
            if (this.data === null) {
                return null;
            }
            const data = this.data?.map(groupData => groupData.map(
                (rowData, index) => ({
                    id: (index + this.numRowsAbove).toString(),
                    data: rowData,
                    size: this.scrollerItemSize,
                    index,
                    scrollIndex: index + this.numRowsAbove,
                    isTop: true
                })
            ));
            if (this.enableVirtualScrolling) {
                if (this.bottomData.length > 0) {
                    let hasPlaceholder = this.topDataLength > 0;
                    if (hasPlaceholder) {
                        data[0].push({ id: 'dots', size: this.scrollerItemSize, dots: true });
                    }
                    this.bottomData.forEach((rowData, index) => {
                        const scrollIndex = index + this.numRowsAbove + this.topDataLength + (hasPlaceholder ? 1 : 0);
                        data[0].push({
                            id: scrollIndex.toString(),
                            data: rowData,
                            size: this.scrollerItemSize,
                            index,
                            scrollIndex,
                            isTop: false
                        });
                    });
                }
            }
            this.currentExpanded.forEach((scrollIndex) => {
                const contentHeight = this.getContentHeight(scrollIndex);
                data[0][scrollIndex - this.numRowsAbove].size += contentHeight;
            });
            return data;
        },
        currentSelectionMap() {
            return (index, isTop) => {
                if (typeof index === 'undefined') {
                    return false;
                }
                return isTop ? this.currentSelection[0][index] : this.currentBottomSelection[index];
            };
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
        fullBodyHeight() {
            let numberOfGroups = 0; let numberOfRows = 0;
            if (this.data) {
                for (const dataGroup of this.data) {
                    if (dataGroup.length > 0) {
                        numberOfGroups++;
                        numberOfRows += dataGroup.length;
                    }
                }
            }
            const numberOfBottomRows = this.bottomData.length;
            if (numberOfBottomRows > 0) {
                // plus 1 because of the additional "…" row
                numberOfRows += numberOfBottomRows + 1;
            }
            return this.scrollerItemSize * numberOfRows +
            (this.tableConfig.groupByConfig?.currentGroup ? numberOfGroups * HEADER_HEIGHT : 0);
        },
        currentBodyHeight() {
            let bodyHeight = this.currentTableHeight - this.headerAndFilterHeight;
            if (this.hasHorizontalScrollbar) {
                bodyHeight -= this.scrollBarWidth;
            }
            return Math.max(bodyHeight, 0);
        },
        hasHorizontalScrollbar() {
            // plus 1 to avoid rounding errors
            return this.currentBodyWidth > this.wrapperWidth + 1;
        },
        headerAndFilterHeight() {
            return HEADER_HEIGHT + (this.filterActive ? HEADER_HEIGHT : 0);
        },
        currentTableHeight() {
            const bottomControlsHeight = this.tableConfig.showBottomControls ? CONTROLS_HEIGHT : 0;
            const availableSpace = this.wrapperHeight - CONTROLS_HEIGHT - bottomControlsHeight;
            let fullTableHeight = this.headerAndFilterHeight + this.fullBodyHeight;
            if (this.hasHorizontalScrollbar) {
                fullTableHeight += this.scrollBarWidth;
            }
            if (this.fitToContainer) {
                return Math.max(Math.min(fullTableHeight, availableSpace), 0);
            }
            return fullTableHeight;
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
    mounted() {
        this.scrollBarWidth = getScrollbarWidth();
        this.wrapperResizeObserver.observe(this.$refs.wrapper);
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
        onHeaderSubMenuItemSelection(item, colInd) {
            consola.debug(`TableUI emitting: headerSubMenuItemSelection ${item} ${colInd}`);
            this.$emit('headerSubMenuItemSelection', item, colInd);
        },
        onRowSelect(selected, rowInd, groupInd, isTop) {
            consola.debug(`TableUI emitting: rowSelect ${selected} ${rowInd} ${groupInd} ${isTop}`);
            this.$emit('rowSelect', selected, rowInd, groupInd, isTop);
        },
        onRowExpand(expanded, scrollIndex) {
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
        registerExpandedSubMenu(callback) {
            // Timeout to prevent the sub menu to be closed due to scroll event triggered by clicking a row/group
            setTimeout(() => {
                this.closeExpandedSubMenu = callback;
            }, 100);
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
            const contentHeight = this.$refs[`row-${index}`]?.map(
                (component) => component.$el.children[1]?.clientHeight
            ).find(height => typeof height !== 'undefined');
            return contentHeight || 0;
        },
        getCellContentSlotName(columnKeys, columnId) {
            // see https://vuejs.org/guide/essentials/template-syntax.html#dynamic-argument-syntax-constraints
            return `cellContent-${columnKeys[columnId]}`;
        }
    }
};
</script>

<template>
  <div
    ref="wrapper"
    class="wrapper"
  >
    <table
      ref="table"
      class="table"
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
      <div
        class="horizontal-scroll"
        :style="{height: `${currentTableHeight}px`}"
      >
        <Header
          :table-config="tableConfig"
          :column-headers="columnHeaders"
          :column-sub-headers="columnSubHeaders"
          :column-sizes="columnSizes"
          :column-sub-menu-items="columnHeaderSubMenuItems"
          :column-sort-configs="columnSortConfigs"
          :is-selected="totalSelected > 0"
          :filters-active="filterActive"
          :current-table-height="currentTableHeight"
          :class="tableHeaderClass"
          :style="{ width: `${currentBodyWidth}px` }"
          @header-select="onSelectAll"
          @column-sort="onColumnSort"
          @toggle-filter="onToggleFilter"
          @column-resize="onColumnResize"
          @sub-menu-item-selection="onHeaderSubMenuItemSelection"
        />
        <ColumnFilters
          v-if="filterActive"
          :filter-configs="columnFilterConfigs"
          :column-headers="columnHeaders"
          :column-sizes="columnSizes"
          :types="columnTypes"
          :show-collapser="tableConfig.showCollapser"
          :show-selection="tableConfig.showSelection"
          :style="{ width: `${currentBodyWidth}px` }"
          @column-filter="onColumnFilter"
          @clear-filter="onClearFilter"
        />
        <div
          class="body"
          :style="{ width: `${currentBodyWidth}px`, height: fitToContainer ? `${currentBodyHeight}px` : '100%'}"
          @scroll="closeExpandedSubMenu"
        >
          <Group
            v-for="(dataGroup, groupInd) in scrollData"
            :key="groupInd"
            :title="getGroupName(groupInd)"
            :group-sub-menu-items="tableConfig.groupSubMenuItems"
            :show="data.length > 1 && dataGroup.length > 0"
            @group-sub-menu-click="onGroupSubMenuClick($event, dataGroup)"
            @group-sub-menu-expand="registerExpandedSubMenu"
          >
            <RecycleScroller
              v-if="enableVirtualScrolling && scrollData.length === 1"
              :key="scrollerKey"
              #default="{ item }"
              ref="scroller"
              :items="dataGroup"
              :num-items-above="numRowsAbove"
              :num-items-below="numRowsBelow"
              :empty-item="{
                data: [],
                size: scrollerItemSize,
                tableConfig: {showCollapser: false, showSelection: false, subMenuItems: [], showPopovers: false}
              }"
              class="scroller"
              :emit-update="true"
              :page-mode="false"
              @update="onScroll"
            >
              <PlaceholderRow
                v-if="item.dots"
                :height="item.size"
              />
              <Row
                v-else
                :key="item.id"
                :ref="`row-${item.id}`"
                :row="columnKeys.map(column => item.data[column])"
                :table-config="item.tableConfig || tableConfig"
                :column-configs="dataConfig.columnConfigs"
                :row-config="dataConfig.rowConfig"
                :row-height="rowHeight"
                :margin-bottom="rowMarginBottom"
                :is-selected="currentSelectionMap(item.index, item.isTop)"
                :show-border-column-index="showBorderColumnIndex"
                @row-select="onRowSelect($event, item.index, 0, item.isTop)"
                @row-expand="onRowExpand($event, item.scrollIndex, item.isTop)"
                @row-input="onRowInput(
                  { ...$event, rowInd: item.index, id: item.data.id, groupInd: 0, isTop: item.isTop}
                )"
                @row-sub-menu-expand="registerExpandedSubMenu"
                @row-sub-menu-click="event => onRowSubMenuClick(event, item.data)"
              >
                <!-- Vue requires named slots on "custom" elements (i.e. template). -->
                <!-- eslint-disable vue/valid-v-slot -->
                <template
                  v-for="colInd in slottedColumns"
                  #[getCellContentSlotName(columnKeys,colInd)]="cellData"
                  :key="rowInd + '_' + colInd"
                >
                  <span>
                    <slot
                      :name="`cellContent-${columnKeys[colInd]}`"
                      :data="{ ...cellData, key: columnKeys[colInd], rowInd, colInd }"
                    />
                  </span>
                </template>
                <template #rowCollapserContent>
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
              :show-border-column-index="showBorderColumnIndex"
              @row-select="onRowSelect($event, rowInd, groupInd, true)"
              @row-input="onRowInput({ ...$event, rowInd, id: row.data.id, groupInd, isTop: true })"
              @row-sub-menu-expand="registerExpandedSubMenu"
              @row-sub-menu-click="onRowSubMenuClick($event, row.data)"
            >
              <!-- Vue requires named slots on "custom" elements (i.e. template). -->
              <!-- eslint-disable vue/valid-v-slot -->
              <template
                v-for="colInd in slottedColumns"
                #[getCellContentSlotName(columnKeys,colInd)]="cellData"
                :key="rowInd + '_' + colInd"
              >
                <span>
                  <slot
                    :name="`cellContent-${columnKeys[colInd]}`"
                    :data="{ ...cellData, key: columnKeys[colInd], rowInd, colInd }"
                  />
                </span>
              </template>
              <template #rowCollapserContent>
                <slot
                  name="collapserContent"
                  :row="row"
                />
              </template>
            </Row>
          </Group>
        </div>
      </div>
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
  height: 100%;
  overflow-y: auto;
}

.wrapper {
  height: 100%;
  position: relative;
}

table,
thead,
tbody {
  width: 100%;
}

table {
  height: 100%;
  font-size: 13px;
  font-weight: 400;
  table-layout: fixed;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  margin-right: auto;

  & .horizontal-scroll {
    display: flex;
    flex-direction: column;
    overflow-x: auto;
    overflow-y: hidden;
    flex: 1;
  }

  & .body {
    overflow-y: auto;
    display: block;

    & :deep(tbody) {
      display: block;
      height:100%;
    }

    & :deep(td > a) {
      text-decoration: none;
      display: block;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 100%;
      padding-right: 15px;
    }

    & :deep(td:first-child > a) {
      padding-left: 15px;
    }
  }
}

table :deep(tr) {
  display: flex;

  &:not(:first-child, :last-child) {
    padding: 0 5px;
  }
}

.empty-message {
  font-size: 13px;
  line-height: 18px;
}

:deep(.more-button) { /* standard focus on button interferes when clicked */
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
