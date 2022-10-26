<script>
import TopControls from './control/TopControls.vue';
import BottomControls from './control/BottomControls.vue';
import ColumnFilters from './filter/ColumnFilters.vue';
import Header from './layout/Header.vue';
import Group from './layout/Group.vue';
import Row from './layout/Row.vue';
import ActionButton from './ui/ActionButton.vue';
import TablePopover from './popover/TablePopover.vue';

const widthColumnMarginLeft = 10;
const widthColumnSelection = 30;
const widthColumnFilter = 30;

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
        TablePopover
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
                    pageConfig: ['currentSize', 'tableSize', 'pageSize', 'possiblePageSizes', 'currentPage'],
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
        'columnResize'
    ],
    data() {
        return {
            filterActive: false,
            popoverTarget: null,
            popoverData: null,
            popoverColumn: null,
            popoverRenderer: null,
            // the index of the column that is currently being resized and for which a border should be shown
            showBorderColumnIndex: null
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
        shouldFixHeaders() {
            return Boolean(this.dataConfig.rowConfig?.fixHeader);
        },
        currentBodyWidth() {
            const widthContentColumns = this.columnSizes.reduce((prev, curr) => prev + curr + widthColumnMarginLeft, 0);
            return (this.tableConfig.showSelection ? widthColumnSelection : 0) +
                widthContentColumns + (this.tableConfig.showColumnFilters ? widthColumnFilter : 0);
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
        // Event handling
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
            this.$emit('rowSelect', selected, rowInd, groupInd);
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
        onShowColumnBorder(columnIndex) {
            this.showBorderColumnIndex = columnIndex;
        },
        onHideColumnBorder() {
            this.showBorderColumnIndex = null;
        },
        getCellContentSlotName(columnId) {
            // see https://vuejs.org/guide/essentials/template-syntax.html#dynamic-argument-syntax-constraints
            return `cellContent-${columnId}`;
        }
    }
};
</script>

<template>
  <div
    class="wrapper"
    :class="{ 'sticky-header': shouldFixHeaders}"
  >
    <table
      ref="table"
      :style="{ width: `${currentBodyWidth}px` }"
    >
      <TopControls
        :table-config="tableConfig"
        :column-headers="columnHeaders"
        :style="{ width: `${currentBodyWidth}px` }"
        @next-page="onPageChange(1)"
        @prev-page="onPageChange(-1)"
        @column-update="onColumnUpdate"
        @column-reorder="onColumnReorder"
        @group-update="onGroupUpdate"
        @search-update="onSearch"
        @time-filter-update="onTimeFilterUpdate"
      />
      <Header
        :table-config="tableConfig"
        :column-headers="columnHeaders"
        :column-sub-headers="columnSubHeaders"
        :column-sizes="columnSizes"
        :is-selected="totalSelected > 0"
        :filters-active="filterActive"
        :class="tableHeaderClass"
        :style="{ width: `${currentBodyWidth}px` }"
        @header-select="onSelectAll"
        @column-sort="onColumnSort"
        @toggle-filter="onToggleFilter"
        @column-resize="onColumnResize"
        @show-column-border="onShowColumnBorder"
        @hide-column-border="onHideColumnBorder"
      />
      <ColumnFilters
        v-if="filterActive"
        :filter-configs="columnFilterConfigs"
        :column-headers="columnHeaders"
        :column-sizes="columnSizes"
        :types="columnTypes"
        :show-collapser="tableConfig.showCollapser"
        :style="{ width: `${currentBodyWidth}px` }"
        @column-filter="onColumnFilter"
        @clear-filter="onClearFilter"
      />
      <div
        class="table-group-wrapper"
        :style="{ width: `${currentBodyWidth}px` }"
      >
        <Group
          v-for="(dataGroup, groupInd) in data"
          :key="groupInd"
          :title="getGroupName(groupInd)"
          :group-sub-menu-items="tableConfig.groupSubMenuItems"
          :show="data.length > 1 && dataGroup.length > 0"
          @group-sub-menu-click="onGroupSubMenuClick($event, dataGroup)"
        >
          <Row
            v-for="(row, rowInd) in dataGroup"
            :key="row.id"
            :row="columnKeys.map(column => row[column])"
            :table-config="tableConfig"
            :column-configs="dataConfig.columnConfigs"
            :row-config="dataConfig.rowConfig"
            :is-selected="currentSelection[groupInd][rowInd]"
            :show-border-column-index="showBorderColumnIndex"
            @row-select="onRowSelect($event, rowInd, groupInd)"
            @row-input="onRowInput({ ...$event, rowInd, id: row.id, groupInd })"
            @row-sub-menu-click="onRowSubMenuClick($event, row)"
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
      <BottomControls
        v-if="tableConfig.showBottomControls"
        :page-config="tableConfig.pageConfig"
        :style="{ width: `${currentBodyWidth}px` }"
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
  margin: auto;

  & .table-group-wrapper {
    display: block;

    & :deep(tbody) {
      display: block;
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

.sticky-header {
  height: 100%;
  overflow-y: hidden;

  & table {
    height: 100%;
    overflow-y: hidden;

    & .table-group-wrapper {
      overflow-y: auto;
      overflow-x: clip;
    }
  }
}

@media only screen and (max-width: 1180px) {
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

@media only screen and (max-width: 750px) {
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
