<script>
import BaseControls from './BaseControls.vue';
import ControlDropdown from './ControlDropdown.vue';
import ControlMultiselect from './ControlMultiselect.vue';
import FilterInputField from '../filter/FilterInputField.vue';

import FunctionButton from 'webapps-common/ui/components/FunctionButton.vue';
import SearchIcon from 'webapps-common/ui/assets/img/icons/lens.svg';

import { tableTimeFilters } from '@/config/time.config';

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
 * @emits $listeners from @see BaseControls
 */
export default {
    components: {
        BaseControls,
        FilterInputField,
        ControlDropdown,
        ControlMultiselect,
        FunctionButton,
        SearchIcon
    },
    props: {
        tableConfig: {
            type: Object,
            default: () => ({})
        },
        columnHeaders: {
            type: Array,
            default: () => []
        }
    },
    emits: ['timeFilterUpdate', 'columnReorder', 'columnUpdate', 'groupUpdate', 'searchUpdate'],
    data() {
        return {
            searchActive: false,
            timeFilters: Object.keys(tableTimeFilters)
        };
    },
    computed: {
        showTimeFilter() {
            return Boolean(this.tableConfig?.timeFilterConfig);
        },
        timeFilter() {
            return this.tableConfig?.timeFilterConfig?.currentTimeFilter;
        },
        showColumnSelection() {
            return Boolean(this.tableConfig?.columnSelectionConfig);
        },
        possibleColumns() {
            return this.tableConfig?.columnSelectionConfig?.possibleColumns;
        },
        showGroupBy() {
            return Boolean(this.tableConfig?.groupByConfig);
        },
        currentGroup() {
            return this.tableConfig?.groupByConfig?.currentGroup;
        },
        possibleGroups() {
            return this.tableConfig?.groupByConfig?.possibleGroups;
        },
        showSearch() {
            return this.tableConfig?.searchConfig;
        },
        searchQuery() {
            return this.tableConfig?.searchConfig?.searchQuery;
        }
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
  <BaseControls
    class="base-controls"
    v-bind="$attrs"
    :page-config="tableConfig.pageConfig"
    :has-carousel="showTimeFilter || showGroupBy || showColumnSelection"
  >
    <template #carousel>
      <ControlDropdown
        v-if="showTimeFilter"
        :model-value="timeFilter"
        :possible-values="getSelectItems(timeFilters)"
        :placeholder="timeFilter"
        :aria-label="'Filter by time'"
        @update:model-value="onTimeFilterSelect"
      />
      <ControlMultiselect
        v-if="showColumnSelection"
        lock-placeholder
        :model-value="columnHeaders"
        :possible-values="getSelectItems(possibleColumns)"
        placeholder="Select columns"
        @update:model-value="onColumnSelect"
        @column-reorder="onColumnReorder"
      />
      <ControlDropdown
        v-if="showGroupBy"
        include-placeholder
        :model-value="currentGroup || ''"
        :possible-values="getSelectItems(possibleGroups)"
        :placeholder="'Group by…'"
        :aria-label="'Group by category'"
        :formatter="group => `Grouped by '${group}'`"
        @update:model-value="onGroupSelect"
      />
    </template>
    <template #rightmost-control>
      <FilterInputField
        v-if="showSearch && searchActive"
        ref="searchField"
        class="input-control"
        :model-value="searchQuery"
        :placeholder="'Search'"
        :style="{minWidth: '100px'}"
        @update:model-value="onSearch"
        @blur="onSearchBlur"
      />
      <FunctionButton
        v-if="showSearch"
        class="search-toggle"
        @click="onSearchClick"
      >
        <SearchIcon />
      </FunctionButton>
    </template>
  </BaseControls>
</template>

<style lang="postcss" scoped>
.base-controls {
  line-height: 40px;
  border-spacing: unset;
  border-collapse: unset;
  vertical-align: baseline;


  & span {
    line-height: 50px;
  }

  & :deep(.function-button) {
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

  & :deep(.search-toggle.function-button) {
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
