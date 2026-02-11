<script setup lang="ts">
import { toRef } from "vue";

import { Checkbox } from "@knime/components";

import type TableConfig from "@/types/TableConfig";
import {
  COMPACT_ROW_PADDING_TOP_BOTTOM,
  ROW_MARGIN_BOTTOM,
} from "@/util/constants";
import { useIndicesAndStylesFor } from "../composables/useHorizontalIndicesAndStyles";

const props = defineProps<{
  width: number;
  height: number;
  compact: boolean;
  columnSizes: number[];
  specialColumnSizes: {
    collapserSize: number;
    selectionSize: number;
    deletionSize: number;
    rightSideSize: number;
  };
  tableConfig: TableConfig;
}>();

const { indexedData: indexedRow, style: rowStyles } = useIndicesAndStylesFor(
  toRef(props, "columnSizes"),
);
</script>

<template>
  <!--class "row" required for deep selector from knime-core-ui-->
  <tr
    :class="`row${compact ? ' compact-mode' : ''}`"
    :style="{
      ...rowStyles,
      height: `${height - ROW_MARGIN_BOTTOM}px`,
      marginBottom: `${ROW_MARGIN_BOTTOM}px`,
    }"
  >
    <td v-if="tableConfig.enableRowDeletion" class="deletion-cell-spacer" />
    <td v-if="tableConfig.showSelection" class="select-cell">
      <Checkbox :disabled="true" />
    </td>
    <td
      v-for="[cellSize, cellIndex] of indexedRow"
      :key="cellIndex"
      class="skeleton-wrapper"
      :style="{
        width: `${cellSize ?? 100}px`,
        paddingTop: `${COMPACT_ROW_PADDING_TOP_BOTTOM}px`,
        paddingBottom: `${COMPACT_ROW_PADDING_TOP_BOTTOM}px`,
      }"
    >
      <div class="skeleton" />
    </td>
  </tr>
</template>

<style lang="postcss" scoped>
@import url("../../assets/skeleton.css");

tr {
  background-color: var(--knime-white);
  display: flex;

  & td {
    &.deletion-cell-spacer {
      min-width: 30px;
      width: 30px;
    }

    &.select-cell {
      min-width: 30px;
      width: 30px;
      padding: 5px 0 0;

      & :deep(label) {
        padding: 0;
        display: inline;
        max-width: unset;
        bottom: 3px;
        left: 8px;
      }
    }

    &.skeleton-wrapper {
      width: 100%;
      height: 100%;
      padding-left: 10px;
      align-items: center;
      justify-content: center;
    }

    & .skeleton {
      width: 100%;
      height: min(100%, 20px);
    }
  }

  &.compact-mode {
    & td {
      & :deep(label) {
        bottom: 5px;
      }

      &.select-cell {
        padding-top: 0;
      }
    }
  }
}
</style>
