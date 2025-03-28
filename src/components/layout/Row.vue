<script setup lang="ts">
/**
 * A table row element which is used for displaying data in the table body. It offers a
 * wide range of functionality which is described in the following sections:
 *
 * Collapsible content:
 * This component can be optionally collapsible for showing row-specific details/content.
 * This expand capability is slotted for flexibility.
 *
 * Selection:
 * Each row can also be selectable- with a checkbox in the first position of the row.
 *
 * SubMenu:
 * A row can display a SubMenu in the last position of the row with row-specific actions
 * configured via props.
 *
 * Editable rows:
 * A cell in the row can be editable and render an input field or other component to allow
 * real time interactions and events.
 *
 * Cell events:
 * DOM events are triggered on a cell-by-cell basis for both clicking and hovering. These events
 * emit information about the data of the cell and the index of the column in the row.
 *
 * Dynamic cell content:
 * Specific columns can be slotted for dynamic rendering methods or configured to use a pre-determined
 * rendering component with the Vue Component/v-is API.
 *
 * @emits rowSelect event when selection is enabled and a row checkbox is toggled.
 * @emits rowInput event when table cells are clicked, cell input is triggered or a hover event is
 *    detected.
 * @emits rowSubMenuClick event when a row SubMenu action is triggered.
 */

import { type Ref, computed, ref, toRef, watch } from "vue";
import throttle from "raf-throttle";

import { Checkbox, type MenuItem, SubMenu } from "@knime/components";
import OptionsIcon from "@knime/styles/img/icons/menu-options.svg";

import type { ColumnConfig, RowConfig } from "@/types/DataConfig";
import { VirtualElementAnchor } from "@/types/DataValueView";
import type TableConfig from "@/types/TableConfig";
import { getPropertiesFromColumns, unpackObjectRepresentation } from "@/util";
import {
  COMPACT_ROW_PADDING_TOP_BOTTOM,
  DEFAULT_ROW_HEIGHT,
  DEFAULT_ROW_PADDING_TOP_BOTTOM,
  ROW_MARGIN_BOTTOM,
} from "@/util/constants";
import { injectRegisterExpandedSubMenu } from "../composables/useCloseSubMenusOnScroll";
import { useIndicesAndStylesFor } from "../composables/useHorizontalIndicesAndStyles";
import CollapserToggle from "../ui/CollapserToggle.vue";

import Cell from "./Cell.vue";

interface RowProps {
  rowData?: { subMenuItemsForRow?: MenuItem[] };
  row?: any[];
  tableConfig: TableConfig;
  columnConfigs: ColumnConfig[];
  rowConfig?: RowConfig;
  rowHeight?: number | "dynamic";
  isSelected?: boolean;
  minRowHeight?: number;
  showDragHandle?: boolean;
  selectCellsOnMove?: boolean;
  disableRowHeightTransition?: boolean;
  selectedCellIndex?: number | null;
  toBeExpandedCellIndex?: number | null;
}

const props = withDefaults(defineProps<RowProps>(), {
  rowData: () => ({}),
  rowConfig: () => ({}),
  row: () => [],
  rowHeight: DEFAULT_ROW_HEIGHT,
  minRowHeight: 0,
  isSelected: false,
  selectCellsOnMove: false,
  showDragHandle: false,
  disableRowHeightTransition: false,
  selectedCellIndex: null,
  toBeExpandedCellIndex: null,
});

const { indexedData: indexedRow, style: rowStyles } = useIndicesAndStylesFor(
  toRef(props, "row"),
);

const emit = defineEmits<{
  rowSelect: [value: any];
  rowInput: [event: any];
  rowSubMenuClick: [item: any];
  resizeAllRows: [size: number, rowElement: HTMLElement];
  resizeRow: [size: number];
  cellSelect: [index: number, ignoreIfSelected: boolean];
  expandCellSelect: [index: number];
  dataValueView: [index: number, anchor: VirtualElementAnchor];
}>();

const showContent = ref(false);
const currentRowHeight = ref(props.rowHeight);
const paddingTopBottom = computed(() =>
  props.rowConfig.compactMode
    ? COMPACT_ROW_PADDING_TOP_BOTTOM
    : DEFAULT_ROW_PADDING_TOP_BOTTOM,
);

watch(
  () => props.rowHeight,
  (newRowHeight) => {
    currentRowHeight.value = newRowHeight;
  },
);
const activeDrag = ref(false);
const rowHeightOnDragStart = ref(0);

const columnKeys = computed(() =>
  getPropertiesFromColumns(props.columnConfigs, "key"),
);
const columnSizes = computed(() =>
  getPropertiesFromColumns(props.columnConfigs, "size"),
);

const formatters = computed(() =>
  getPropertiesFromColumns(props.columnConfigs, "formatter"),
);
const classGenerators = computed(() =>
  getPropertiesFromColumns(props.columnConfigs, "classGenerator"),
);
const slottedColumns = computed(() =>
  getPropertiesFromColumns(props.columnConfigs, "hasSlotContent"),
);
const hasDataValueView = computed(() =>
  getPropertiesFromColumns(props.columnConfigs, "hasDataValueView"),
);

const noPadding = computed(() =>
  getPropertiesFromColumns(props.columnConfigs, "noPadding"),
);

const clickableColumns = computed(() =>
  getPropertiesFromColumns(props.columnConfigs, "popoverRenderer").map(
    (config) => Boolean(config),
  ),
);
const filteredSubMenuItems = computed(() => {
  if (
    !props.tableConfig.subMenuItems?.length &&
    !props.rowData?.subMenuItemsForRow?.length
  ) {
    return [];
  }

  return props.rowData?.subMenuItemsForRow?.length
    ? props.rowData?.subMenuItemsForRow
    : props.tableConfig.subMenuItems;
});
const onRowExpand = () => {
  showContent.value = !showContent.value;
};
const onSelect = (value: any) => {
  emit("rowSelect", value);
};
const onCellClick = (event: any, colInd: number, data: any) => {
  emit("rowInput", {
    ...event,
    type: "click",
    value: null,
    colInd,
    data,
  });
};
const onInput = (event: any) => {
  emit("rowInput", { type: "input", ...event });
};
const onSubMenuItemClick = (event: Event, clickedItem: any) => {
  emit("rowSubMenuClick", clickedItem);
  if (clickedItem.callback) {
    event.preventDefault();
    return false;
  }
  return true;
};
const registerExpandedSubMenu = injectRegisterExpandedSubMenu();
const onSubMenuToggle = (_event: Event, callback: () => void) =>
  registerExpandedSubMenu(callback);
const isClickableByConfig = (ind: number) => {
  return Boolean(props.tableConfig.showPopovers) && clickableColumns.value[ind];
};
const getCellContentSlotName = (columnKeys: any, columnId: any) => {
  // see https://vuejs.org/guide/essentials/template-syntax.html#dynamic-argument-syntax-constraints
  return `cellContent-${columnKeys[columnId]}`;
};
const onPointerDown = (event: PointerEvent) => {
  if (currentRowHeight.value === "dynamic") {
    return;
  }
  consola.debug("Resize via row drag triggered: ", event);
  // stop the event from propagating up the DOM tree
  event.stopPropagation();
  // capture move events until the pointer is released
  (event.target as Element).setPointerCapture(event.pointerId);
  activeDrag.value = true;
  rowHeightOnDragStart.value = currentRowHeight.value;
};

const rowElement: Ref<null | HTMLElement> = ref(null);
const onPointerUp = (event: PointerEvent) => {
  if (activeDrag.value) {
    consola.debug("Resize via row drag ended: ", event);
    activeDrag.value = false;
    emit("resizeAllRows", currentRowHeight.value as number, rowElement.value!);
  }
};
const onPointerMove = throttle((event) => {
  if (activeDrag.value) {
    consola.debug("Resize via drag ongoing: ", event);
    const newRowHeight =
      event.clientY - rowElement.value!.getBoundingClientRect().top;
    currentRowHeight.value = Math.max(newRowHeight, props.minRowHeight);
    emit("resizeRow", currentRowHeight.value - rowHeightOnDragStart.value);
  }
});
const onLostPointerCapture = throttle(() => {
  activeDrag.value = false;
});
const cells: Ref<Record<number, any>> = ref({});
const getCellComponents = () => {
  return props.row.map((_, columnIndex) => cells.value[columnIndex]);
};
const onCellSelect = ({
  expandSelection,
  ind,
  ignoreIfSelected = false,
}: {
  expandSelection: boolean;
  ind: number;
  ignoreIfSelected?: boolean;
}) => {
  if (expandSelection) {
    emit("expandCellSelect", ind);
  } else {
    emit("cellSelect", ind, ignoreIfSelected);
  }
};

const onDataValueView = (index: number) => {
  const anchor = cells.value[index].$el.getBoundingClientRect();
  emit("dataValueView", index, anchor);
};

const rowHeightStyle = computed(() =>
  currentRowHeight.value === "dynamic"
    ? {}
    : { height: `${currentRowHeight.value}px` },
);

const transitionInactiveDrag = computed(() => {
  const rowHeightTransition = props.disableRowHeightTransition
    ? ""
    : "height 0.3s, ";
  return { transition: `${rowHeightTransition}box-shadow 0.15s` };
});

const transition = computed(() =>
  activeDrag.value ? {} : transitionInactiveDrag.value,
);

defineExpose({
  getCellComponents,
  /**
   * For TableUI test purposes only
   */
  onRowExpand,
});
</script>

<template>
  <tr
    v-if="row.length > 0"
    ref="rowElement"
    :class="[
      'row',
      {
        'no-sub-menu': !filteredSubMenuItems?.length,
        'compact-mode': rowConfig.compactMode,
      },
    ]"
    :style="{
      ...rowStyles,
      ...transition,
      ...rowHeightStyle,
      marginBottom: `${ROW_MARGIN_BOTTOM}px`,
    }"
  >
    <CollapserToggle
      v-if="tableConfig.showCollapser"
      :expanded="showContent"
      :compact-mode="rowConfig.compactMode"
      class="collapser-cell"
      @collapser-expand="onRowExpand"
    />
    <td v-if="tableConfig.showSelection" class="select-cell">
      <Checkbox
        :model-value="isSelected"
        :disabled="tableConfig.disableSelection"
        @update:model-value="onSelect"
      />
    </td>
    <Cell
      v-for="[cell, ind] of indexedRow"
      :ref="
        (el) => {
          cells[ind] = el;
        }
      "
      :key="ind"
      :cell-data="cell"
      :select-on-move="selectCellsOnMove"
      :is-selected="selectedCellIndex === ind"
      :is-to-be-expanded="toBeExpandedCellIndex === ind"
      :is-slotted="Boolean(slottedColumns[ind])"
      :has-data-value-view="
        tableConfig.enableDataValueViews && Boolean(hasDataValueView[ind])
      "
      :no-padding="noPadding[ind]"
      :size="columnSizes[ind] ?? 100"
      :class-generators="classGenerators[ind]"
      :is-clickable-by-config="isClickableByConfig(ind)"
      :formatter="formatters[ind]"
      :default-top-bottom-padding="paddingTopBottom"
      @click="onCellClick($event, ind, cell)"
      @select="onCellSelect({ ...$event, ind })"
      @data-value-view="onDataValueView(ind)"
      @input="onInput"
    >
      <template #default="{ width }">
        <slot
          :name="getCellContentSlotName(columnKeys, ind)"
          :row="row"
          :cell="unpackObjectRepresentation(cell)"
          :height="rowHeight"
          :width="width"
          :ind="ind"
        />
      </template>
    </Cell>
    <td
      v-if="filteredSubMenuItems?.length"
      button-title="actions"
      class="action"
    >
      <SubMenu
        teleport-to-body
        :items="filteredSubMenuItems"
        button-title="actions"
        @item-click="onSubMenuItemClick"
        @toggle="onSubMenuToggle"
      >
        <OptionsIcon />
      </SubMenu>
    </td>
  </tr>
  <tr v-else class="row empty-row" :style="rowHeightStyle">
    <td>-</td>
  </tr>
  <div
    v-if="showDragHandle && !selectCellsOnMove"
    class="row-drag-handle"
    @pointerdown.passive="onPointerDown"
    @pointerup.passive="onPointerUp"
    @pointermove="onPointerMove"
    @lostpointercapture="onLostPointerCapture"
  />
  <tr v-if="showContent" class="collapser-row">
    <td class="expandable-content">
      <slot name="rowCollapserContent" />
    </td>
  </tr>
</template>

<style lang="postcss" scoped>
tr {
  display: flex;
}

tr.row {
  background-color: var(--knime-white);

  &.empty-row {
    padding-left: 20px;
  }

  & td {
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0;

    &.collapser-cell {
      min-width: 30px;
    }

    &.select-cell {
      min-width: 30px;
      width: 30px;
      padding-top: 5px;

      & :deep(label) {
        padding: 0;
        display: inline;
        max-width: unset;
        bottom: 3px;
        left: 8px;
      }
    }

    &.action {
      align-items: center;
      display: flex;
      overflow: visible;
      min-width: 30px;

      & svg {
        margin: 0 auto;
        width: 25px;
        height: 25px;
        stroke-width: calc(32px / 25);
        stroke: var(--knime-dove-gray);
      }

      & :deep(ul) {
        margin-top: -10px;
        right: 10px;
      }

      & :deep(.submenu-toggle) {
        display: flex;
        align-self: stretch;
        align-items: center;
        height: 40px;
        width: 30px;
        border-radius: 0;
        transition: background-color 0.15s;
      }
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

      &.action :deep(.submenu-toggle) {
        height: 24px;
      }
    }
  }

  &:hover {
    outline: none;
    box-shadow: 1px 1px 4px 0 var(--knime-gray-dark-semi);
  }

  & a {
    outline: none;
  }
}

.row-drag-handle {
  height: 5px;
  opacity: 0;
  bottom: 5px;
  margin-bottom: -5px;
  cursor: row-resize;
  position: relative;
}

tr.collapser-row {
  background-color: var(--knime-gray-ultra-light);
  padding: 30px 50px 20px;
  margin-bottom: 2px;
  position: relative;

  & td.expandable-content {
    width: 100%;
  }
}
</style>
