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

import CollapserToggle from "../ui/CollapserToggle.vue";
import SubMenu from "webapps-common/ui/components/SubMenu.vue";
import Checkbox from "webapps-common/ui/components/forms/Checkbox.vue";
import FunctionButton from "webapps-common/ui/components/FunctionButton.vue";
import OptionsIcon from "webapps-common/ui/assets/img/icons/menu-options.svg";
import CloseIcon from "webapps-common/ui/assets/img/icons/close.svg";
import { DEFAULT_ROW_HEIGHT } from "@/util/constants";
import { unpackObjectRepresentation } from "@/util";
import Cell from "./Cell.vue";
import throttle from "raf-throttle";
import type { ColumnConfig, RowConfig } from "../types/DataConfig";
import { ref, computed, watch, onMounted, nextTick, type Ref } from "vue";

interface RowProps {
  rowData?: { data?: { subMenuItemsForRow?: unknown[] } };
  row?: any[];
  tableConfig: any;
  columnConfigs: ColumnConfig[];
  rowConfig?: RowConfig;
  rowHeight?: number | "dynamic";
  isSelected?: boolean;
  marginBottom?: number;
  minRowHeight?: number;
  showDragHandle?: boolean;
  selectCellsOnMove?: boolean;
}

const props = withDefaults(defineProps<RowProps>(), {
  rowData: () => ({}),
  rowConfig: () => ({}),
  row: () => [],
  rowHeight: DEFAULT_ROW_HEIGHT,
  marginBottom: 0,
  minRowHeight: 0,
  isSelected: false,
  selectCellsOnMove: false,
  showDragHandle: false,
});

const emit = defineEmits([
  "rowSelect",
  "rowInput",
  "rowSubMenuClick",
  "rowSubMenuExpand",
  "rowExpand",
  "resizeAllRows",
  "resizeRow",
  "cellSelect",
  "expandCellSelect",
]);

const showContent = ref(false);
const currentRowHeight = ref(props.rowHeight);
watch(
  () => props.rowHeight,
  (newRowHeight) => {
    currentRowHeight.value = newRowHeight;
  },
);
const activeDrag = ref(false);
const rowHeightOnDragStart = ref(0);
const getPropertiesFromColumns = computed(() => (key: keyof ColumnConfig) => {
  return props.columnConfigs.map((colConfig: ColumnConfig) => colConfig[key]);
});

const columnKeys = computed(() => getPropertiesFromColumns.value("key"));
const columnSizes = computed(() => getPropertiesFromColumns.value("size"));
const formatters = computed(() => getPropertiesFromColumns.value("formatter"));
const classGenerators = computed(() =>
  getPropertiesFromColumns.value("classGenerator"),
);
const slottedColumns = computed(() =>
  getPropertiesFromColumns.value("hasSlotContent"),
);
const clickableColumns = computed(() =>
  getPropertiesFromColumns
    .value("popoverRenderer")
    .map((config) => Boolean(config)),
);
const filteredSubMenuItems = computed(() => {
  if (
    !props.tableConfig.subMenuItems?.length &&
    !props.rowData.data?.subMenuItemsForRow?.length
  ) {
    return [];
  }
  const defaultSubMenuItems = props.tableConfig.subMenuItems.filter(
    (item: any) => {
      if (typeof item.hideOn === "function") {
        return !item.hideOn(props.row, props.rowData);
      }
      return true;
    },
  );

  return props.rowData.data?.subMenuItemsForRow?.length
    ? props.rowData.data?.subMenuItemsForRow
    : defaultSubMenuItems;
});

onMounted(() => {
  // Reverts emitted event if component is not ready
  emit("rowExpand", showContent.value);
});
const onRowExpand = () => {
  showContent.value = !showContent.value;
  nextTick(() => emit("rowExpand", showContent.value));
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
const onSubMenuItemClick = (event: any, clickedItem: any) => {
  emit("rowSubMenuClick", clickedItem);
  if (clickedItem.callback) {
    event.preventDefault();
    return false;
  }
  return true;
};
const onSubMenuToggle = (_event: Event, callback: () => void) => {
  emit("rowSubMenuExpand", callback);
};
const isClickableByConfig = (ind: number) => {
  return props.tableConfig.showPopovers && clickableColumns.value[ind];
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
    emit("resizeAllRows", currentRowHeight.value, rowElement);
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
}: {
  expandSelection: boolean;
  ind: number;
}) => {
  if (expandSelection) {
    emit("expandCellSelect", ind);
  } else {
    emit("cellSelect", ind);
  }
};
defineExpose({
  getCellComponents,
  /**
   * For TableUI test purposes only
   */
  onRowExpand,
});
</script>

<template>
  <div ref="rowElement">
    <tr
      v-if="row.length > 0"
      :class="[
        'row',
        {
          'no-sub-menu': !filteredSubMenuItems.length,
          'compact-mode': rowConfig.compactMode,
        },
      ]"
      :style="{
        ...(currentRowHeight === 'dynamic'
          ? {}
          : { height: `${currentRowHeight}px` }),
        marginBottom: `${marginBottom}px`,
        ...(activeDrag ? {} : { transition: 'height 0.3s, box-shadow 0.15s' }),
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
        v-for="(data, ind) in row"
        :ref="
          (el) => {
            cells[ind] = el;
          }
        "
        :key="ind"
        :cell-data="data"
        :select-on-move="selectCellsOnMove"
        :is-slotted="slottedColumns[ind]"
        :size="columnSizes[ind] ?? 100"
        :class-generators="classGenerators[ind]"
        :is-clickable-by-config="isClickableByConfig(ind)"
        :formatter="formatters[ind]"
        @click="onCellClick($event, ind, data)"
        @select="onCellSelect({ ...$event, ind })"
        @input="onInput"
      >
        <template #default="{ width }">
          <slot
            :name="getCellContentSlotName(columnKeys, ind)"
            :row="row"
            :cell="unpackObjectRepresentation(data)"
            :height="rowHeight"
            :width="width"
            :ind="ind"
          />
        </template>
      </Cell>
      <td
        v-if="filteredSubMenuItems.length"
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
    <tr v-else class="row empty-row">
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
        <FunctionButton class="collapser-button" @click="onRowExpand">
          <CloseIcon />
        </FunctionButton>
        <slot name="rowCollapserContent" />
      </td>
    </tr>
  </div>
</template>

<style lang="postcss" scoped>
tr {
  display: flex;
}

.row-drag-handle {
  height: 5px;
  opacity: 0;
  bottom: 5px;
  margin-bottom: -5px;
  cursor: row-resize;
  position: relative;
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

    &.data-cell {
      padding: 12px 0;
    }

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
      padding: 0;

      &.data-cell {
        padding: 5px 0;
      }

      & :deep(label) {
        bottom: 5px;
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

tr.collapser-row {
  background-color: var(--knime-gray-ultra-light);
  padding: 30px 50px 20px;
  margin-bottom: 2px;
  position: relative;

  & td.expandable-content {
    width: 100%;

    & .collapser-button {
      position: absolute;
      right: 50px;
      top: 20px;
      height: 24px;
      width: 24px;
      padding: 3px;
      z-index: var(--z-index-collapser-button);

      & svg {
        position: relative;
        margin: auto;
        width: 14px;
        height: 14px;
        stroke-width: calc(32px / 12);
        stroke: var(--knime-masala);
        top: 0;
      }
    }
  }
}
</style>
