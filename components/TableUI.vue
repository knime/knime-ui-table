<script>
import TopControls from './control/TopControls';
import BottomControls from './control/BottomControls';
import ColumnFilters from './filter/ColumnFilters';
import Header from './layout/Header';
import Group from './layout/Group';
import Row from './layout/Row';
import ActionButton from './ui/ActionButton';
import TablePopover from './popover/TablePopover';

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
    data() {
        return {
            filterActive: false,
            popoverTarget: null,
            popoverData: null,
            popoverColumn: null,
            popoverRenderer: null
        };
    },
    computed: {
        /*
         * Current table config. E.g. if 4/10 columns displayed, 'current' fields return values w/ length 4.
         */
        columnHeaders() {
            return this.getPropertiesFromColumns('header');
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
        }
    }
};
</script>

<template>
  <div class="wrapper">
    <table
      ref="table"
    >
      <TopControls
        :table-config="tableConfig"
        :column-headers="columnHeaders"
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
        :column-sizes="columnSizes"
        :is-selected="totalSelected > 0"
        :filters-active="filterActive"
        :class="tableHeaderClass"
        @headerSelect="onSelectAll"
        @columnSort="onColumnSort"
        @toggleFilter="onToggleFilter"
      />
      <ColumnFilters
        v-if="filterActive"
        :filter-configs="columnFilterConfigs"
        :column-headers="columnHeaders"
        :column-sizes="columnSizes"
        :types="columnTypes"
        :show-collapser="tableConfig.showCollapser"
        @columnFilter="onColumnFilter"
        @clearFilter="onClearFilter"
      />
      <Group
        v-for="(dataGroup, groupInd) in data"
        :key="groupInd"
        :title="getGroupName(groupInd)"
        :group-sub-menu-items="tableConfig.groupSubMenuItems"
        :show="data.length > 1 && dataGroup.length > 0"
        @groupSubMenuClick="event => onGroupSubMenuClick(event, dataGroup)"
      >
        <Row
          v-for="(row, rowInd) in dataGroup"
          :key="row.id"
          :row="columnKeys.map(column => row[column])"
          :table-config="tableConfig"
          :column-configs="dataConfig.columnConfigs"
          :is-selected="currentSelection[groupInd][rowInd]"
          @rowSelect="selected => onRowSelect(selected, rowInd, groupInd)"
          @rowInput="event => onRowInput({ ...event, rowInd, id: row.id, groupInd })"
          @rowSubMenuClick="event => onRowSubMenuClick(event, row)"
        >
          <!-- Vue requires named slots on "custom" elements (i.e. template). -->
          <template
            v-for="colInd in slottedColumns"
            #[`cellContent-${columnKeys[colInd]}`]="cellData"
          >
            <!-- Vue requires key on real element for dynamic scoped slots to help Vue framework manage events. -->
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
      <BottomControls
        v-if="tableConfig.showBottomControls"
        :page-config="tableConfig.pageConfig"
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
