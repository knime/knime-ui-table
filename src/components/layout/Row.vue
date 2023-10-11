<script>
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
export default {
  components: {
    CollapserToggle,
    SubMenu,
    Checkbox,
    FunctionButton,
    OptionsIcon,
    CloseIcon,
    Cell,
  },
  props: {
    /**
     * rowData contains the data that is passed on by the overlying repeater in the table. In contrast to the row
     * property rowData contains the complete set and not just the part that is displayed per column.
     * @param {Array} rowData.data.subMenuItemsForRow   Define a set of subMenuItems just for this row. If you use this, set showSubMenu on the Table to 'always'.
     */
    rowData: {
      type: Object,
      default: () => ({}),
    },
    /**
     * row contains contains the elements that are rendered per column into the row. this represents a subset of rowData.
     */
    row: {
      type: Array,
      default: () => [],
    },
    tableConfig: {
      type: Object,
      default: () => ({}),
    },
    columnConfigs: {
      type: Array,
      default: () => [],
    },
    rowConfig: {
      type: Object,
      default: () => ({}),
    },
    rowHeight: {
      type: Number,
      default: DEFAULT_ROW_HEIGHT,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    showBorderColumnIndex: {
      type: Number,
      default: null,
    },
    marginBottom: {
      type: Number,
      default: 0,
    },
    minRowHeight: {
      type: Number,
      default: 0,
    },
    showDragHandle: {
      type: Boolean,
      default: false,
    },
    selectCellsOnMove: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "rowSelect",
    "rowInput",
    "rowSubMenuClick",
    "rowSubMenuExpand",
    "rowExpand",
    "resizeAllRows",
    "resizeRow",
    "cellSelect",
    "expandCellSelect",
  ],
  data() {
    return {
      showContent: false,
      currentRowHeight: this.rowHeight,
      activeDrag: false,
    };
  },
  computed: {
    columnKeys() {
      return this.getPropertiesFromColumns("key");
    },
    columnSizes() {
      return this.getPropertiesFromColumns("size");
    },
    formatters() {
      return this.getPropertiesFromColumns("formatter");
    },
    classGenerators() {
      return this.getPropertiesFromColumns("classGenerator");
    },
    slottedColumns() {
      return this.getPropertiesFromColumns("hasSlotContent");
    },
    clickableColumns() {
      // enforce boolean to reduce reactivity
      return this.getPropertiesFromColumns("popoverRenderer").map((config) =>
        Boolean(config),
      );
    },
    classes() {
      return this.row.map((item, ind) =>
        this.classGenerators[ind]?.map((classItem) => {
          if (typeof classItem === "function") {
            return classItem(item);
          }
          if (typeof classItem === "object") {
            return classItem[item];
          }
          return classItem;
        }),
      );
    },
    filteredSubMenuItems() {
      if (
        !this.tableConfig.subMenuItems?.length &&
        !this.rowData.data?.subMenuItemsForRow?.length
      ) {
        return [];
      }
      const defaultSubMenuItems = this.tableConfig.subMenuItems.filter(
        (item) => {
          if (typeof item.hideOn === "function") {
            return !item.hideOn(this.row, this.rowData);
          }
          return true;
        },
      );

      return this.rowData.data?.subMenuItemsForRow?.length
        ? this.rowData.data?.subMenuItemsForRow
        : defaultSubMenuItems;
    },
  },
  watch: {
    rowHeight: {
      handler(newVal) {
        this.currentRowHeight = newVal;
      },
    },
  },
  mounted() {
    // Reverts emited event if component is not ready
    this.$emit("rowExpand", this.showContent);
  },
  methods: {
    getPropertiesFromColumns(key) {
      return this.columnConfigs.map((colConfig) => colConfig[key]);
    },
    onRowExpand() {
      this.showContent = !this.showContent;
      this.$nextTick(() => this.$emit("rowExpand", this.showContent));
    },
    onSelect(value) {
      this.$emit("rowSelect", value);
    },
    onCellClick(event, colInd, data) {
      this.$emit("rowInput", {
        ...event,
        type: "click",
        value: null,
        colInd,
        data,
      });
    },
    onInput(event) {
      this.$emit("rowInput", { type: "input", ...event });
    },
    onSubMenuItemClick(event, clickedItem) {
      this.$emit("rowSubMenuClick", clickedItem);
      if (clickedItem.callback) {
        event.preventDefault();
        return false;
      }
      return true;
    },
    onSubMenuToggle(_event, callback) {
      this.$emit("rowSubMenuExpand", callback);
    },
    isClickableByConfig(ind) {
      return this.tableConfig.showPopovers && this.clickableColumns[ind];
    },
    getCellContentSlotName(columnKeys, columnId) {
      // see https://vuejs.org/guide/essentials/template-syntax.html#dynamic-argument-syntax-constraints
      return `cellContent-${columnKeys[columnId]}`;
    },
    unpackObjectRepresentation,
    onPointerDown(event) {
      consola.debug("Resize via row drag triggered: ", event);
      // stop the event from propagating up the DOM tree
      event.stopPropagation();
      // capture move events until the pointer is released
      event.target.setPointerCapture(event.pointerId);
      this.activeDrag = true;
      this.rowHeightOnDragStart = this.currentRowHeight;
    },
    onPointerUp(event) {
      if (this.activeDrag) {
        consola.debug("Resize via row drag ended: ", event);
        this.activeDrag = false;
        this.$emit("resizeAllRows", this.currentRowHeight, this.$el);
      }
    },
    onPointerMove: throttle(function (event) {
      /* eslint-disable no-invalid-this */
      if (this.activeDrag) {
        consola.debug("Resize via drag ongoing: ", event);
        const newRowHeight =
          event.clientY - this.$el.getBoundingClientRect().top;
        this.currentRowHeight = Math.max(newRowHeight, this.minRowHeight);
        this.$emit(
          "resizeRow",
          this.currentRowHeight - this.rowHeightOnDragStart,
        );
      }
      /* eslint-enable no-invalid-this */
    }),
    onLostPointerCapture: throttle(function () {
      // eslint-disable-next-line no-invalid-this
      this.activeDrag = false;
    }),
    getCellComponents() {
      return this.row.map(
        (_, columnIndex) => this.$refs[`cell-${columnIndex}`][0],
      );
    },
    onCellSelect({ expandSelection, ind }) {
      if (expandSelection) {
        this.$emit("expandCellSelect", ind);
      } else {
        this.$emit("cellSelect", ind);
      }
    },
  },
};
</script>

<template>
  <div>
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
        height: `${currentRowHeight}px`,
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
        :ref="`cell-${ind}`"
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
      @pointerdown.passive="onPointerDown($event)"
      @pointerup.passive="onPointerUp($event)"
      @pointermove="onPointerMove"
      @lostpointercapture="onLostPointerCapture"
      @scroll="onScroll"
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 40px;
    padding: 0;

    &.collapser-cell {
      min-width: 30px;
    }

    &.select-cell {
      min-width: 30px;
      width: 30px;

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

    & :deep(.missing-value-icon) {
      height: 40px;
    }
  }

  &.compact-mode {
    & td {
      line-height: 24px;

      & :deep(label) {
        bottom: 5px;
      }

      &.action :deep(.submenu-toggle) {
        height: 24px;
      }

      & :deep(.missing-value-icon) {
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
