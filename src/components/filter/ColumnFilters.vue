<script lang="ts">
import ControlMultiselect from "../control/ControlMultiselect.vue";
import FilterInputField from "./FilterInputField.vue";
import ControlDropdown from "../control/ControlDropdown.vue";
import type FilterConfig from "@/types/FilterConfig";
import FunctionButton from "webapps-common/ui/components/FunctionButton.vue";
import TrashIcon from "webapps-common/ui/assets/img/icons/trash.svg";
import { MIN_COLUMN_SIZE } from "@/util/constants";
import { toRef, type PropType } from "vue";
import { useIndicesAndStylesFor } from "../composables/useHorizontalIndicesAndStyles";

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
    ControlMultiselect,
    FilterInputField,
    ControlDropdown,
    FunctionButton,
    TrashIcon,
  },
  props: {
    filterConfigs: {
      type: Array as PropType<Array<FilterConfig | undefined>>,
      default: () => [],
    },
    columnHeaders: {
      type: Array as PropType<Array<string>>,
      default: () => [],
    },
    columnSizes: {
      type: Array as PropType<Array<number>>,
      default: () => [],
    },
    showCollapser: {
      type: Boolean,
      default: false,
    },
    showSelection: {
      type: Boolean,
      default: false,
    },
  },
  /* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  emits: {
    columnFilter: (colInd: number, value: FilterConfig["modelValue"]) => true,
    clearFilter: () => true,
  },
  setup(props) {
    const { indexedData: indexedColumnHeaders, style: headerStyle } =
      useIndicesAndStylesFor(toRef(props, "columnHeaders"));
    return { indexedColumnHeaders, headerStyle };
  },
  /* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  data() {
    return {
      MIN_COLUMN_SIZE,
    };
  },
  methods: {
    getFilterConfigProps(filterConfig: FilterConfig) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { is: _, ...other } = filterConfig;
      return other;
    },
    onInput(colInd: number, value: FilterConfig["modelValue"]) {
      consola.debug("Updated table column filter: ", value);
      this.$emit("columnFilter", colInd, value);
    },
    onClearFilter() {
      consola.debug("Table column filter cleared.");
      this.$emit("clearFilter");
    },
  },
};
</script>

<template>
  <thead>
    <tr :style="{ ...headerStyle }">
      <th v-if="showCollapser" class="collapser-cell-spacer" />
      <th v-if="showSelection" class="select-cell-spacer" />
      <th
        v-for="[header, ind] in indexedColumnHeaders"
        :key="ind + 'filter'"
        :style="{ width: `calc(${columnSizes[ind] || MIN_COLUMN_SIZE}px)` }"
        :cell-type="'th'"
        class="filter"
      >
        <template v-if="filterConfigs[ind]">
          <Component
            :is="filterConfigs[ind]!.is"
            is-filter
            v-bind="getFilterConfigProps(filterConfigs[ind]!)"
            :placeholder="header"
            :aria-label="`filter-${header}`"
            @update:model-value="onInput(ind, $event)"
          />
        </template>
      </th>
      <th class="action">
        <FunctionButton @click="onClearFilter">
          <TrashIcon />
        </FunctionButton>
      </th>
    </tr>
  </thead>
</template>

<style lang="postcss" scoped>
tr {
  display: flex;
  height: 40px;
  overflow-x: clip;
  transition:
    height 0.3s,
    box-shadow 0.15s;
  background-color: var(--knime-silver-sand-semi);
  backdrop-filter: blur(5px);

  & th {
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;

    &.filter {
      margin: auto 0;
      padding-left: 10px;
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
    position: sticky;
    right: 0;
    background-color: var(--knime-porcelain);
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
