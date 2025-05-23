<script lang="ts">
import type { PropType } from "vue";

import { FunctionButton, SubMenu } from "@knime/components";
import SearchIcon from "@knime/styles/img/icons/lens.svg";
import SettingsIcon from "@knime/styles/img/icons/settings.svg";

import { tableTimeFilters } from "@/config/time.config";
import type TableConfig from "@/types/TableConfig";
import isSinglePage from "@/util/isSinglePage";
import FilterInputField from "../filter/FilterInputField.vue";

import BaseControls from "./BaseControls.vue";
import ControlDropdown from "./ControlDropdown.vue";
import ControlMultiselect from "./ControlMultiselect.vue";

/**
 * Table controls for the top of the table optionally consisting of page controls,
 * time filter selection, column selection, "group-by" options and a search field.
 * and a drop-"up" selection input for table page size.
 *
 * @emits timeFilterUpdate when the time filter value changes.
 * @emits columnUpdate when the selected columns change.
 * @emits columnReorder when column order changes.
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
    SearchIcon,
    SettingsIcon,
    SubMenu,
  },
  props: {
    tableConfig: {
      type: Object as PropType<TableConfig>,
      default: () => ({}),
    },
    columnHeaders: {
      type: Array as PropType<Array<string>>,
      default: () => [],
    },
  },
  /* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  emits: {
    timeFilterUpdate: (newTimeFilter: string) => true,
    columnReorder: (colInd: number, newInd: number) => true,
    columnUpdate: (newColumns: string[]) => true,
    groupUpdate: (newGroup: string) => true,
    searchUpdate: (newSearchQuers: string) => true,
  },
  /* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  data() {
    return {
      searchActive: false,
      timeFilters: Object.keys(tableTimeFilters),
    };
  },
  computed: {
    showTimeFilter() {
      return Boolean(this.tableConfig.timeFilterConfig);
    },
    timeFilter() {
      return this.tableConfig.timeFilterConfig?.currentTimeFilter;
    },
    showColumnSelection() {
      return Boolean(this.tableConfig.columnSelectionConfig);
    },
    possibleColumns() {
      return this.tableConfig.columnSelectionConfig?.possibleColumns;
    },
    showGroupBy() {
      return Boolean(this.tableConfig.groupByConfig);
    },
    currentGroup() {
      return this.tableConfig.groupByConfig?.currentGroup;
    },
    possibleGroups() {
      return this.tableConfig.groupByConfig?.possibleGroups;
    },
    showSearch() {
      return this.tableConfig.searchConfig;
    },
    searchQuery() {
      return this.tableConfig.searchConfig?.searchQuery;
    },
    hasCarousel() {
      return (
        this.showTimeFilter || this.showGroupBy || this.showColumnSelection
      );
    },
    showTopControls() {
      const multiplePages = !isSinglePage(
        this.tableConfig.pageConfig?.currentSize,
        this.tableConfig.pageConfig?.pageSize,
      );
      return (
        this.tableConfig.pageConfig?.showTableSize ||
        this.showSearch ||
        multiplePages ||
        this.hasCarousel ||
        Boolean(this.tableConfig.settingsItems?.length)
      );
    },
  },
  methods: {
    getSelectItems(itemArr: string[]) {
      return itemArr?.length
        ? itemArr.map((item) => ({ id: item, text: item }))
        : [];
    },
    onTimeFilterSelect(timeFilter: string) {
      consola.debug("Updated time filter: ", timeFilter);
      this.$emit("timeFilterUpdate", timeFilter);
    },
    onColumnSelect(columns: string[]) {
      consola.debug("Updated table column filter: ", columns);
      this.$emit("columnUpdate", columns);
    },
    onColumnReorder(columnInd: number, newInd: number) {
      consola.debug("Updated table column order: ", columnInd, newInd);
      this.$emit("columnReorder", columnInd, newInd);
    },
    onGroupSelect(group: string) {
      consola.debug("Updated table group filter: ", group);
      this.$emit("groupUpdate", group);
    },
    onSearchClick() {
      this.searchActive = !this.searchActive;
      if (this.showSearch && this.searchActive) {
        this.$nextTick(() => {
          const focus = (this.$refs.searchField as HTMLElement)?.focus;
          if (typeof focus === "function") {
            focus();
          }
        });
      } else {
        this.$emit("searchUpdate", "");
      }
    },
    onSearchBlur() {
      this.searchActive = false;
      this.$emit("searchUpdate", "");
    },
    onSearch(input: string) {
      consola.debug("Updated search: ", input);
      this.$emit("searchUpdate", input);
    },
  },
};
</script>

<template>
  <BaseControls
    v-if="showTopControls"
    class="base-controls"
    v-bind="$attrs"
    :page-config="tableConfig.pageConfig"
    :has-carousel="hasCarousel"
  >
    <template #carousel>
      <!-- eslint-disable vue/attribute-hyphenation typescript complains with ':aria-label' instead of ':ariaLabel'-->
      <ControlDropdown
        v-if="showTimeFilter"
        :model-value="timeFilter"
        :possible-values="getSelectItems(timeFilters)"
        :placeholder="timeFilter"
        :ariaLabel="'Filter by time'"
        @update:model-value="onTimeFilterSelect"
      />
      <ControlMultiselect
        v-if="showColumnSelection"
        lock-placeholder
        :model-value="columnHeaders"
        :possible-values="getSelectItems(possibleColumns!)"
        placeholder="Select columns"
        @update:model-value="onColumnSelect"
        @column-reorder="onColumnReorder"
      />
      <ControlDropdown
        v-if="showGroupBy"
        include-placeholder
        :model-value="currentGroup || ''"
        :possible-values="getSelectItems(possibleGroups!)"
        :placeholder="'Group by…'"
        :ariaLabel="'Group by category'"
        :formatter="(group: string) => `Grouped by '${group}'`"
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
        :style="{ minWidth: '100px' }"
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
      <SubMenu
        v-if="tableConfig.settingsItems?.length"
        ref="subMenu"
        :items="tableConfig.settingsItems"
        orientation="right"
        button-title="Open settings"
      >
        <SettingsIcon class="icon" />
      </SubMenu>
    </template>
  </BaseControls>
</template>

<style lang="postcss" scoped>
.base-controls {
  line-height: 40px;
  font-size: 13px;
  border-spacing: unset;
  border-collapse: unset;
  vertical-align: baseline;

  & span {
    line-height: 50px;
  }

  & .search-toggle {
    position: relative;
    margin: 0;
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
