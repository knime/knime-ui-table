<script>
import TableFilterMultiselect from './TableFilterMultiselect';
import TableFilterInputField from './TableFilterInputField';
import TableFilterDropdown from './TableFilterDropdown';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';
import { columnTypes, columnFilterTypes } from '../../config/table.config';

/**
 * A table header element which dynamically created table data elements containing
 * input fields for modifying column-specific filter values. It also has a button
 * to trigger a reset of all current filter values.
 *
 * @emits headerFilter event when a filter value is modified.
 * @emits clearFilter event when the filters are cleared.
 */
export default {
    components: {
        TableFilterMultiselect,
        TableFilterInputField,
        TableFilterDropdown,
        FunctionButton,
        CloseIcon
    },
    props: {
        columns: {
            type: Array,
            default: () => []
        },
        columnWidths: {
            type: Array,
            default: () => []
        },
        filterConfigs: {
            type: Array,
            default: () => []
        },
        types: {
            type: Array,
            default: () => []
        },
        showCollapser: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            columnTypes,
            columnFilterTypes,
            requirePossibleValues: ['TableFilterMultiselect', 'TableFilterDropdown']
        };
    },
    computed: {
        possibleValues() {
            return this.columns.map((col, colInd) => {
                if (this.requirePossibleValues.includes(this.columnFilterTypes[this.types[colInd]])) {
                    return this.filterConfigs[colInd].domain.map(val => ({ id: val, text: val }));
                }
                return null;
            });
        }
    },
    methods: {
        onInput(columnInd, value) {
            consola.debug('Updated table column filter: ', value);
            this.$emit('headerFilter', { colInd: columnInd, values: value });
        },
        onClearFilter() {
            consola.debug('Table column filter cleared.');
            this.$emit('clearFilter');
        }
    }
};
</script>

<template>
  <thead>
    <tr>
      <th
        v-if="showCollapser"
        class="collapser-cell-spacer"
      />
      <th class="select-cell-spacer" />
      <th
        v-for="(column, ind) in columns"
        :key="ind + 'filter'"
        :style="{ width: `calc(${columnWidths[ind] || 100}% - 15px)` }"
        :cell-type="'th'"
        class="filter"
      >
        <Component
          :is="columnFilterTypes[types[ind]]"
          :value="filterConfigs[ind].value"
          :placeholder="column"
          :aria-label="`filter-${column}`"
          :possible-values="possibleValues[ind]"
          @input="value => onInput(ind, value)"
        />
      </th>
      <th class="action">
        <FunctionButton @click="onClearFilter">
          <CloseIcon />
        </FunctionButton>
      </th>
    </tr>
  </thead>
</template>

<style lang="postcss" scoped>

tr {
  margin-top: -2px;
  height: 40px;
  transition: height 0.3s, box-shadow 0.15s;
  background-color: var(--knime-silver-sand-semi);

  & th {
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;

    &.filter {
      margin: auto 5px auto 10px;
    }

    &.collapser-cell-spacer {
      min-width: 30px;
      padding: 0;
    }

    &.select-cell-spacer {
      min-width: 30px;
      padding: 0;
      display: flex;
      flex-direction: column-reverse;
      position: relative;
    }
  }

  & th.action {
    align-items: center;
    display: flex;
    overflow: visible;
    padding: 0;
    margin-right: -1px;

    & svg {
      margin: 0 2px;
      width: 14px;
      height: 14px;
      stroke-width: calc(32px / 14);
      stroke: var(--knime-masala);

      &:last-child,
      &:first-child {
        margin-right: 2px; /* important to override function button styles */
      }
    }

    & >>> .function-button {
      display: flex;
      align-self: stretch;
      align-items: center;
      height: 40px;
      width: 30px;
      border-radius: 0;
      transition: background-color 0.15s;
    }
  }

  &:hover {
    outline: none;
    box-shadow: 1px 1px 4px 0 var(--knime-gray-dark-semi);
  }
}
</style>
