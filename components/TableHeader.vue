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
 * @emits rowSelect event when the checkbox is selected for table-wide toggling of selection.
 * @emits headerSort event when a column name is clicked to trigger sorting.
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
        row: {
            type: Array,
            default: () => []
        },
        columnSort: {
            type: Number,
            default: 0
        },
        sortDirection: {
            type: Number,
            default: 1
        },
        columnWidths: {
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
        },
        showCollapser: {
            type: Boolean,
            default: false
        },
        showSelection: {
            type: Boolean,
            default: true
        },
        showColumnFilters: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            height: 40
        };
    },
    methods: {
        onSelect() {
            this.$emit('rowSelect', !this.isSelected, true);
        },
        onHeaderClick(ind) {
            this.$emit('headerSort', {
                type: 'sort',
                ind,
                value: this.row[ind]
            });
        },
        onToggleFilter() {
            this.$emit('toggleFilter');
        }
    }
};
</script>

<template>
  <thead>
    <tr v-if="row.length > 0">
      <th
        v-if="showCollapser"
        :cell-type="'th'"
        class="collapser-cell-spacer"
      />
      <th
        v-if="showSelection"
        class="select-cell"
      >
        <Checkbox
          :value="isSelected"
          @input="onSelect"
        />
      </th>
      <th
        v-for="(data, ind) in row"
        :key="ind"
        :style="{ width: `calc(${columnWidths[ind] || 100}%)` }"
        :class="['column-header', {'inverted': sortDirection === -1}]"
        tabindex="0"
        @click="onHeaderClick(ind)"
        @keydown.space="onHeaderClick(ind)"
      >
        <ArrowIcon :class="['icon', { active: columnSort === ind }]" />
        <div :class="['header-text-container', { 'with-icon': columnSort === ind }]">
          {{ data }}
        </div>
      </th>
      <th
        v-if="showColumnFilters"
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
@import "webapps-common/ui/css/variables";

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
        cursor: pointer;
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
