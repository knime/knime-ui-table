<script>
import FilterMultiselect from './FilterMultiselect.vue';
import FilterInputField from './FilterInputField.vue';
import FilterDropdown from './FilterDropdown.vue';
import FunctionButton from 'webapps-common/ui/components/FunctionButton.vue';
import CloseIcon from 'webapps-common/ui/assets/img/icons/close.svg';
import { MIN_COLUMN_SIZE } from '@/util/constants';

/**
 * A table header element which dynamically created table data elements containing
 * input fields for modifying column-specific filter values. It also has a button
 * to trigger a reset of all current filter values.
 *
 * @emits columnFilter event when a filter value is modified.
 * @emits clearFilter event when the filters are cleared.
 */
export default {
    components: {
        FilterMultiselect,
        FilterInputField,
        FilterDropdown,
        FunctionButton,
        CloseIcon
    },
    props: {
        filterConfigs: {
            type: Array,
            default: () => []
        },
        columnHeaders: {
            type: Array,
            default: () => []
        },
        columnSizes: {
            type: Array,
            default: () => []
        },
        showCollapser: {
            type: Boolean,
            default: false
        },
        showSelection: {
            type: Boolean,
            default: false
        }
    },
    emits: ['columnFilter', 'clearFilter'],
    data() {
        return { MIN_COLUMN_SIZE };
    },
    methods: {
        onInput(colInd, value) {
            consola.debug('Updated table column filter: ', value);
            this.$emit('columnFilter', colInd, value);
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
      <th
        v-if="showSelection"
        class="select-cell-spacer"
      />
      <th
        v-for="(column, ind) in columnHeaders"
        :key="ind + 'filter'"
        :style="{ width: `calc(${columnSizes[ind] || MIN_COLUMN_SIZE}px)`}"
        :cell-type="'th'"
        class="filter"
      >
        <Component
          :is="filterConfigs[ind].is"
          v-bind="filterConfigs[ind]"
          :placeholder="column"
          :aria-label="`filter-${column}`"
          @input="onInput(ind, $event)"
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
  overflow-x: clip;
  transition: height 0.3s, box-shadow 0.15s;
  background-color: var(--knime-silver-sand-semi);

  & th {
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;

    &.filter {
      margin: auto 0 auto 10px;
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

    & :deep(.function-button) {
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
