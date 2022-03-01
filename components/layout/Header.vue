<script>
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import ArrowIcon from '~/webapps-common/ui/assets/img/icons/arrow-down.svg?inline';
import FilterIcon from '~/webapps-common/ui/assets/img/icons/filter.svg?inline';

/**
 * A table header element for displaying the column names in a table. This component
 * has a filter-toggle button to programmatically display column filters, a checkbox
 * for selecting all rows in the table and listens for clicks on the individual column
 * headers to allow sorting.
 *
 * @emits headerSelect event when the checkbox is selected for table-wide toggling of selection.
 * @emits columnSort event when a column name is clicked to trigger sorting.
 * @emits toggleFilter event when the filter-toggle control is clicked.
 */
export default {
    components: {
        FunctionButton,
        Checkbox,
        ArrowIcon,
        FilterIcon
    },
    props: {
        tableConfig: {
            type: Object,
            default: () => ({})
        },
        columnHeaders: {
            type: Array,
            default: () => []
        },
        columnSizes: {
            type: Array,
            default: () => []
        },
        isSelected: {
            type: Boolean,
            default: false
        },
        filtersActive: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            height: 40
        };
    },
    computed: {
        enableSorting() {
            return Boolean(this.tableConfig?.sortConfig);
        },
        sortColumn() {
            return this.tableConfig?.sortConfig?.sortColumn;
        },
        sortDirection() {
            return this.tableConfig?.sortConfig?.sortDirection;
        }
    },
    methods: {
        onSelect() {
            this.$emit('headerSelect', !this.isSelected);
        },
        onHeaderClick(ind) {
            if (this.enableSorting) {
                this.$emit('columnSort', ind, this.columnHeaders[ind]);
            }
        },
        onToggleFilter() {
            this.$emit('toggleFilter');
        }
    }
};
</script>

<template>
  <thead>
    <tr v-if="columnHeaders.length > 0">
      <th
        v-if="tableConfig.showCollapser"
        :cell-type="'th'"
        class="collapser-cell-spacer"
      />
      <th
        v-if="tableConfig.showSelection"
        class="select-cell"
      >
        <Checkbox
          :value="isSelected"
          @input="onSelect"
        />
      </th>
      <th
        v-for="(header, ind) in columnHeaders"
        :key="ind"
        :style="{ width: `calc(${columnSizes[ind] || 100}%)` }"
        :class="['column-header', { sortable: enableSorting, inverted: sortDirection === -1} ]"
        tabindex="0"
        @click="onHeaderClick(ind)"
        @keydown.space="onHeaderClick(ind)"
      >
        <ArrowIcon :class="['icon', { active: sortColumn === ind }]" />
        <div :class="['header-text-container', { 'with-icon': sortColumn === ind }]">
          {{ header }}
        </div>
      </th>
      <th
        v-if="tableConfig.showColumnFilters"
        :class="['action', { 'filter-active': filtersActive }]"
      >
        <FunctionButton @click="onToggleFilter">
          <FilterIcon />
        </FunctionButton>
      </th>
    </tr>
    <tr v-else>
      <slot />
    </tr>
  </thead>
</template>

<style lang="postcss" scoped>

thead {
  height: 39px;

  & tr {
    margin-bottom: -2px;
    transition: height 0.3s, box-shadow 0.15s;
    border-top: 1px solid var(--knime-silver-sand-semi);

    & th {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 40px;
      padding: 0;
      text-align: left;

      &.collapser-cell-spacer {
        min-width: 30px;
      }

      &.select-cell {
        min-width: 30px;
        width: 30px;

        & >>> label {
          padding: 0;
          display: inline;
          max-width: unset;
          bottom: 3px;
          left: 8px;
        }
      }

      &.column-header {
        position: relative;
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-end;

        & .header-text-container {
          max-width: calc(100%);
          overflow: hidden;
          text-overflow: ellipsis;
          margin-left: 10px;
          font-weight: 500;

          &.with-icon {
            max-width: calc(100% - 30px);
          }
        }

        & .icon {
          width: 13px;
          height: 13px;
          stroke-width: calc(32px / 13);
          stroke: var(--knime-masala);
          pointer-events: none;
          transition: transform 0.2s ease-in-out;
          margin: auto 5px;
          display: none;

          &.active {
            display: unset;
          }
        }

        &:not(.inverted) .icon.active {
          transform: scaleY(-1);
        }

        &.sortable {
          cursor: pointer;

          &:hover,
          &:focus {
            outline: none;
            color: var(--knime-dove-gray);

            & .icon {
              display: unset;
              stroke: var(--knime-dove-gray);
            }
          }
        }
      }

      &.action {
        align-items: center;
        display: flex;
        overflow: visible;
        min-width: 30px;

        & >>> .function-button {
          display: flex;
          align-self: stretch;
          align-items: center;
          height: 40px;
          width: 30px;
          border-radius: 0;
          transition: background-color 0.15s;

          & svg {
            stroke: var(--knime-masala);
          }
        }

        &.filter-active {
          background-color: var(--theme-button-function-background-color-hover);

          & >>> .function-button {
            & svg {
              fill: var(--knime-masala);
              stroke: var(--knime-masala);
            }
          }
        }
      }
    }

    &:hover {
      outline: none;
    }
  }

  &.sub-menu-active tr {
    padding-right: 30px;
  }
}
</style>
