<script>
import TableControlsBase from './TableControlBase';
import TableControlDropdown from './TableControlDropdown';
import TableControlMultiselect from './TableControlMultiselect';
import TableFilterInputField from '../filter/TableFilterInputField';

import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import SearchIcon from '~/webapps-common/ui/assets/img/icons/lens.svg?inline';

import { tableTimeFilters } from '../../config/time.config';

/**
 * Table controls for the top of the table optionally consisting of page controls,
 * time filter selection, column selection, "group-by" options and a search field.
 * and a drop-"up" selection input for table page size.
 *
 * @emits timeFilterUpdate when the time filter value changes.
 * @emits columnUpdate when the selected columns change.
 * @emits columnReorder when column order changes.
 * @emits columnUpdate when the selected columns change.
 * @emits groupUpdate when the selected group change.
 * @emits searchUpdate when the search field value changes.
 * @emits $listeners from @see TableControlsBase
 */
export default {
    components: {
        TableControlsBase,
        TableFilterInputField,
        TableControlDropdown,
        TableControlMultiselect,
        FunctionButton,
        SearchIcon
    },
    props: {
        totalItems: {
            type: Number,
            default: 0
        },
        currentItems: {
            type: Number,
            default: 0
        },
        pageSize: {
            type: Number,
            default: 0
        },
        currentPage: {
            type: Number,
            default: 0
        },
        allColumns: {
            type: Array,
            default: () => []
        },
        currentColumns: {
            type: Array,
            default: () => []
        },
        allGroups: {
            type: Array,
            default: () => []
        },
        currentGroup: {
            type: String,
            default: () => null
        },
        timeFilter: {
            type: String,
            default: null
        },
        searchQuery: {
            type: String,
            default: ''
        },
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
            default: false
        }
    },
    data() {
        return {
            searchActive: false,
            timeFilters: Object.keys(tableTimeFilters)
        };
    },
    methods: {
        getSelectItems(itemArr) {
            return itemArr?.length ? itemArr.map(item => ({ id: item, text: item })) : [];
        },
        onTimeFilterSelect(timeFilter) {
            consola.debug('Updated time filter: ', timeFilter);
            this.$emit('timeFilterUpdate', timeFilter);
        },
        onColumnSelect(columns) {
            consola.debug('Updated table column filter: ', columns);
            this.$emit('columnUpdate', columns);
        },
        onColumnReorder(columnInd, newInd) {
            consola.debug('Updated table column order: ', columnInd, newInd);
            this.$emit('columnReorder', columnInd, newInd);
        },
        onGroupSelect(group) {
            consola.debug('Updated table group filter: ', group);
            this.$emit('groupUpdate', group);
        },
        onSearchClick() {
            this.searchActive = !this.searchActive;
            if (this.showSearch && this.searchActive) {
                this.$nextTick(() => {
                    if (typeof this.$refs.searchField?.focus === 'function') {
                        this.$refs.searchField.focus();
                    }
                });
            } else {
                this.$emit('searchUpdate', '');
            }
        },
        onSearchBlur() {
            this.searchActive = false;
            this.$emit('searchUpdate', '');
        },
        onSearch(input) {
            consola.debug('Updated search: ', input);
            this.$emit('searchUpdate', input);
        }
    }
};
</script>

<template>
  <TableControlsBase
    class="base-controls"
    v-bind="$props"
    v-on="$listeners"
  >
    <TableControlDropdown
      v-if="showTimeFilter && timeFilter"
      :value="timeFilter"
      :possible-values="getSelectItems(timeFilters)"
      :placeholder="timeFilter"
      :aria-label="'Filter by time'"
      @input="onTimeFilterSelect"
    />
    <TableControlMultiselect
      v-if="showColumns"
      lock-placeholder
      :value="currentColumns"
      :possible-values="getSelectItems(allColumns)"
      placeholder="Select columns"
      @input="onColumnSelect"
      @columnReorder="onColumnReorder"
    />
    <TableControlDropdown
      v-if="showGroups && allGroups.length"
      include-placeholder
      :value="currentGroup || ''"
      :possible-values="getSelectItems(allGroups)"
      :placeholder="'Group by…'"
      :aria-label="'Group by category'"
      :formatter="group => `Grouped by '${group}'`"
      @input="onGroupSelect"
    />
    <TableFilterInputField
      v-if="showSearch && searchActive"
      ref="searchField"
      class="input-control"
      :value="searchQuery"
      :placeholder="'Search'"
      @input="onSearch"
      @blur="onSearchBlur"
    />
    <FunctionButton
      v-if="showSearch"
      class="search-toggle"
      @click="onSearchClick"
    >
      <SearchIcon />
    </FunctionButton>
  </TableControlsBase>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.base-controls {
  line-height: 40px;
  border-spacing: unset;
  border-collapse: unset;
  vertical-align: baseline;


  & span {
    line-height: 50px;
  }

  & >>> .function-button {
    position: relative;
    margin: none;
    height: 28px;
    width: 28px;
    stroke-width: calc(32px / 20);
    stroke: var(--knime-dove-gray);
    top: 0;

    &:hover,
    &:focus {
      background: unset;
    }
  }

  & >>> .search-toggle.function-button {
    display: flex;
    align-self: stretch;
    align-items: center;
    height: 40px;
    width: 30px;
    border-radius: 0;
    transition: background-color 0.15s;
  }
}
</style>
