<!-- eslint-disable max-lines -->
<script lang="ts">
import { type PropType, toRef } from "vue";
import throttle from "raf-throttle";

import {
  Checkbox,
  FunctionButton,
  type MenuItem,
  SubMenu,
} from "@knime/components";
import { KdsButton } from "@knime/kds-components";
import ArrowIcon from "@knime/styles/img/icons/arrow-down.svg";
import ArrowDropdown from "@knime/styles/img/icons/arrow-dropdown.svg";
import FilterIcon from "@knime/styles/img/icons/filter.svg";

import type TableConfig from "@/types/TableConfig";
import { getHeaderPaddingLeft } from "@/util";
import {
  COLUMN_RESIZE_DRAG_HANDLE_WIDTH,
  HEADER_HEIGHT,
  MAX_SUB_MENU_WIDTH,
  MIN_COLUMN_SIZE,
  SPECIAL_COLUMNS_SIZE,
} from "@/util/constants";
import { useIndicesAndStylesFor } from "../composables/useHorizontalIndicesAndStyles";
import { useStartEditingKeydown } from "../composables/useStartEditingKeydown";

const BORDER_TOP = 1;

/**
 * A table header element for displaying the column names in a table. This component
 * has a filter-toggle button to programmatically display column filters, a checkbox
 * for selecting all rows in the table and listens for clicks on the individual column
 * headers to allow sorting.
 *
 * @emits headerSelect event when the checkbox is selected for table-wide toggling of selection.
 * @emits columnSort event when a column name is clicked to trigger sorting.
 * @emits toggleFilter event when the filter-toggle control is clicked.
 * @emits subMenuItemSelection event when the selection of a submenu item is changed
 */
export default {
  components: {
    FunctionButton,
    Checkbox,
    SubMenu,
    ArrowIcon,
    ArrowDropdown,
    FilterIcon,
    KdsButton,
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
    columnSubHeaders: {
      type: Array as PropType<Array<string | undefined>>,
      default: () => [],
    },
    columnSizes: {
      type: Array as PropType<Array<number>>,
      default: () => [],
    },
    columnSortConfigs: {
      type: Array as PropType<Array<boolean>>,
      default: () => [],
    },
    columnSubMenuItems: {
      type: Array as PropType<Array<MenuItem[] | undefined>>,
      default: () => [],
    },
    columnHeaderColors: {
      type: Array as PropType<Array<string | null>>,
      default: () => [],
    },
    columnDeletables: {
      type: Array as PropType<Array<boolean | undefined>>,
      default: () => [],
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    filtersActive: {
      type: Boolean,
      default: false,
    },
    getDragHandleHeight: {
      type: Function,
      default: () => HEADER_HEIGHT,
    },
    showNewColumnButton: {
      type: Boolean,
      default: false,
    },
    selectedHeaderIndex: {
      type: Number as PropType<number | null>,
      default: null,
    },
  },
  /* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  emits: {
    headerSelect: (selected: boolean) => true,
    columnSort: (index: number, header: string) => true,
    toggleFilter: () => true,
    showColumnBorder: () => true,
    columnResize: (index: number, newSize: number) => true,
    hideColumnBorder: () => true,
    subMenuItemSelection: (item: MenuItem, index: number) => true,
    columnResizeEnd: () => true,
    columnResizeStart: () => true,
    allColumnsResize: (newSize: number) => true,
    moveDownFromHeaderCell: (index: number) => true,
    headerCellSelect: (index: number) => true,
    "update:newColumnButtonWidth": (width: number) => true,
    newColumnButtonClick: (event: MouseEvent) => true,
    newColumnButtonKeydownLeft: (event: KeyboardEvent) => true,
    selectionKeydownDown: () => true,
    headerCellDeselect: () => true,
    headerCellStartEditing: (index: number, initialValue?: string) => true,
    deleteColumn: (index: number) => true,
  },
  setup(props, { emit }) {
    const { indexedData: indexedColumnHeaders, style: headerStyles } =
      useIndicesAndStylesFor(toRef(props, "columnHeaders"));

    let currentColumnIndex = 0;
    const onStartEditing = (initialValue?: string) => {
      emit("headerCellStartEditing", currentColumnIndex, initialValue);
    };
    const { onKeydown: startEditingKeydown } = useStartEditingKeydown({
      onExpandAndStartEditing: onStartEditing,
      onStartEditing,
    });

    const onHeaderCellKeydown = (event: KeyboardEvent, columnIndex: number) => {
      currentColumnIndex = columnIndex;
      startEditingKeydown(event);
    };

    return { indexedColumnHeaders, headerStyles, onHeaderCellKeydown };
  },
  /* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  data() {
    return {
      height: 40,
      hoverIndex: null as null | number, // the index of the column that is currently being hovered over; null during resize
      dragIndex: null as null | number, // the index of the column that is currently being dragged / resized
      columnSizeOnDragStart: 0, // the original width of the column that is currently being resized
      pageXOnDragStart: 0, // the x coordinate at which the mouse was clicked when starting the resize drag
      minimumColumnWidth: MIN_COLUMN_SIZE, // need to add this here since it is referenced in the template
      maximumSubMenuWidth: MAX_SUB_MENU_WIDTH,
      currentDragHandlerHeight: 0,
      borderTop: BORDER_TOP,
      focusedHeaderIndex: null as null | number, // the index of the currently focused header cell
    };
  },
  computed: {
    enableSorting() {
      // do not enable sorting when currently resizing or hovering over a drag handle
      return (
        Boolean(this.tableConfig.sortConfig) &&
        this.hoverIndex === null &&
        this.dragIndex === null
      );
    },
    enableColumnResizing() {
      const enableColumnResizingSetting = this.tableConfig.enableColumnResizing;
      if (typeof enableColumnResizingSetting === "undefined") {
        return true;
      } else {
        return enableColumnResizingSetting;
      }
    },
    sortColumn() {
      return this.tableConfig.sortConfig?.sortColumn;
    },
    sortDirection() {
      return this.tableConfig.sortConfig?.sortDirection;
    },
    hasSubHeaders() {
      return this.columnSubHeaders.some((item) => item);
    },
    currentResizeDragHandleWidth() {
      return this.enableColumnResizing ? COLUMN_RESIZE_DRAG_HANDLE_WIDTH : 0;
    },
    columnPaddingsLeft() {
      return this.columnHeaderColors.map((columnHeaderColor) =>
        getHeaderPaddingLeft(columnHeaderColor),
      );
    },
    headerSelectionOverlayStyle(): Record<string, string> | null {
      const columnIndex = this.selectedHeaderIndex;
      if (columnIndex === null || !this.tableConfig.enableHeaderCellSelection) {
        return null;
      }
      let left = 0;
      if (this.tableConfig.showSelection) {
        left += SPECIAL_COLUMNS_SIZE;
      }
      if (this.tableConfig.showCollapser) {
        left += SPECIAL_COLUMNS_SIZE;
      }
      if (this.tableConfig.enableRowDeletion) {
        left += SPECIAL_COLUMNS_SIZE;
      }
      for (let i = 0; i < columnIndex; i++) {
        left += this.columnSizes[i];
      }
      const width = this.columnSizes[columnIndex];
      return {
        left: `${left}px`,
        width: `${width}px`,
      };
    },
  },
  methods: {
    onHeaderCellFocus(columnIndex: number) {
      this.focusedHeaderIndex = columnIndex;
      this.$emit("headerCellSelect", columnIndex);
    },
    onHeaderCellBlur() {
      this.focusedHeaderIndex = null;
    },
    emitNewColumnButtonWidth() {
      const newColumnButtonHead = this.$refs[
        "new-column-button-head"
      ] as HTMLElement;
      this.$emit(
        "update:newColumnButtonWidth",
        newColumnButtonHead.getBoundingClientRect().width ?? 0,
      );
    },
    isColumnSortable(index: number) {
      return this.enableSorting && this.columnSortConfigs[index];
    },
    onSelect() {
      this.$emit("headerSelect", !this.isSelected);
    },
    onHeaderClick(ind: number, header: string) {
      if (
        this.tableConfig.enableHeaderCellSelection &&
        this.selectedHeaderIndex !== ind
      ) {
        this.$emit("headerCellSelect", ind);
      }
      if (this.isColumnSortable(ind)) {
        this.$emit("columnSort", ind, header);
      }
      this.$emit("headerCellStartEditing", ind);
    },
    onToggleFilter() {
      this.$emit("toggleFilter");
    },
    onPointerOver(event: PointerEvent, columnIndex: number) {
      consola.debug("Begin hover over drag handle: ", event);
      if (this.dragIndex === null) {
        this.hoverIndex = columnIndex;
      }
    },
    onPointerLeave(event: Event) {
      consola.debug("End hover over drag handle: ", event);
      if (this.dragIndex === null) {
        this.hoverIndex = null;
      }
    },
    onPointerDown(
      event: PointerEvent & { target: HTMLElement },
      columnIndex: number,
    ) {
      consola.debug("Resize via drag triggered: ", event);
      // stop the event from propagating up the DOM tree
      event.stopPropagation();
      // capture move events until the pointer is released
      event.target.setPointerCapture(event.pointerId);
      this.dragIndex = columnIndex;
      this.currentDragHandlerHeight =
        this.getDragHandleHeight() - this.borderTop;
      this.columnSizeOnDragStart = this.columnSizes[columnIndex];
      this.pageXOnDragStart = event.pageX;
      this.$emit("columnResizeStart");
    },
    onPointerUp(event: PointerEvent) {
      this.$emit("columnResizeEnd");
      if (event.shiftKey) {
        const newColumnSize =
          this.columnSizeOnDragStart + event.pageX - this.pageXOnDragStart;
        this.$emit(
          "allColumnsResize",
          Math.max(newColumnSize, this.minimumColumnWidth),
        );
      }
    },
    /* eslint-disable no-invalid-this */
    onPointerMove: throttle(function (event: PointerEvent) {
      // @ts-expect-error
      this.unthrottledOnPointerMove(event);
    }),
    onNewColumnButtonClick(event: MouseEvent) {
      this.$emit("newColumnButtonClick", event);
    },
    onNewColumnButtonKeydownLeft(event: KeyboardEvent) {
      this.$emit("newColumnButtonKeydownLeft", event);
    },
    unthrottledOnPointerMove(event: PointerEvent) {
      if (this.dragIndex !== null) {
        consola.debug("Resize via drag ongoing: ", event);
        const newColumnSize =
          this.columnSizeOnDragStart + event.pageX - this.pageXOnDragStart;
        this.$emit(
          "columnResize",
          this.dragIndex,
          Math.max(newColumnSize, this.minimumColumnWidth),
        );
      }
    },
    /* The lostpointercapture event is triggered if the pointer capture is lost for any reason, including its
        orderly release via a pointerup event. Because the onPointerMove function is throttled we also need to throttle
        the onLostPointerCapture function to guarantee order of event handling. */
    onLostPointerCapture: throttle(function (event) {
      consola.debug("Resize via drag finished: ", event);
      // @ts-expect-error
      this.dragIndex = null;
      /* Also have to reset hoverIndex since we might no longer be hovering over the drag handle */
      // @ts-expect-error
      this.hoverIndex = null;
    }),
    /* eslint-enable no-invalid-this */
    dragHandleHeight(isDragging: boolean) {
      return isDragging ? this.currentDragHandlerHeight : HEADER_HEIGHT;
    },
    onDeleteColumn(ind: number) {
      this.$emit("deleteColumn", ind);
    },
    onSubMenuItemSelection(item: any, ind: number) {
      this.$emit("subMenuItemSelection", item, ind);
    },
    getHeaderCellWidths() {
      return this.columnHeaders.map((_, columnIndex) => {
        const widthCompleteHeader = Math.ceil(
          (
            this.$refs[`columnHeader-${columnIndex}`] as HTMLElement[]
          )[0].getBoundingClientRect().width,
        );
        const widthMainHeader = Math.ceil(
          (
            this.$refs[`mainHeader-${columnIndex}`] as HTMLElement[]
          )[0].getBoundingClientRect().width,
        );
        const widthHeaderText = (
          this.$refs[`headerText-${columnIndex}`] as HTMLElement[]
        )[0].getBoundingClientRect().width;
        return (
          widthCompleteHeader -
          widthMainHeader +
          widthHeaderText +
          this.currentResizeDragHandleWidth
        );
      });
    },
    /**
     * We deliberately only react on Tab and not on blur since we do
     * want to keep the header in a selected yet unfocused state when
     * the user clicks outside the table.
     */
    onKeydownTab() {
      this.$emit("headerCellDeselect");
    },
    onKeydownLeft(columnIndex: number) {
      if (columnIndex > 0) {
        this.focusHeaderCell(columnIndex - 1);
      }
    },
    onKeydownRight(columnIndex: number) {
      if (columnIndex < this.columnHeaders.length - 1) {
        this.focusHeaderCell(columnIndex + 1);
      } else if (this.showNewColumnButton) {
        if (this.tableConfig.enableHeaderCellSelection) {
          this.$emit("headerCellDeselect");
        }
        this.focusNewColumnButton();
      }
    },
    onKeydownDown(columnIndex: number) {
      if (this.tableConfig.enableCellSelection) {
        this.$emit("moveDownFromHeaderCell", columnIndex);
      }
    },
    focusHeaderCell(cellInd: number) {
      (
        this.$refs[`columnHeaderContent-${cellInd}`] as HTMLDivElement[]
      )[0].focus();
    },
    focusNewColumnButton() {
      (
        this.$refs["new-column-button"] as InstanceType<typeof KdsButton>
      )?.$el.focus();
    },
    focusSelectionCheckbox() {
      (this.$refs["selection-checkbox"] as any)?.$el
        ?.querySelector("input")
        ?.focus();
    },
  },
};
</script>

<template>
  <thead :style="{ '--border-top': `${borderTop}px` }">
    <tr :style="{ ...headerStyles }">
      <th
        v-if="tableConfig.showCollapser"
        :cell-type="'th'"
        :class="['collapser-cell-spacer', { 'with-subheaders': hasSubHeaders }]"
      />
      <th
        v-if="tableConfig.enableRowDeletion"
        :class="['deletion-cell-spacer', { 'with-subheaders': hasSubHeaders }]"
      />
      <th
        v-if="tableConfig.showSelection"
        :class="['select-cell', { 'with-subheaders': hasSubHeaders }]"
        @keydown.down.prevent.stop="$emit('selectionKeydownDown')"
      >
        <Checkbox
          ref="selection-checkbox"
          :model-value="isSelected"
          :disabled="tableConfig.disableSelection"
          @update:model-value="onSelect"
        />
      </th>
      <th
        v-for="[header, ind] in indexedColumnHeaders"
        :key="ind"
        :ref="`columnHeader-${ind}`"
        :style="{
          width: `calc(${columnSizes[ind] || minimumColumnWidth}px)`,
          paddingLeft: `${columnPaddingsLeft[ind]}px`,
          ...(columnHeaderColors[ind]
            ? { '--data-cell-color': columnHeaderColors[ind]! }
            : {}),
        }"
        :class="[
          'column-header',
          { 'colored-header': columnHeaderColors[ind] },
        ]"
      >
        <div
          :ref="`columnHeaderContent-${ind}`"
          class="column-header-content"
          :class="[
            {
              sortable: isColumnSortable(ind),
              inverted: sortDirection === -1,
              'with-subheaders': hasSubHeaders,
              'with-button-in-header':
                columnSubMenuItems[ind] || columnDeletables[ind],
            },
          ]"
          tabindex="0"
          @focus="onHeaderCellFocus(ind)"
          @blur="onHeaderCellBlur"
          @click="onHeaderClick(ind, header)"
          @keydown.space="onHeaderClick(ind, header)"
          @keydown.tab="onKeydownTab"
          @keydown.left.prevent="onKeydownLeft(ind)"
          @keydown.right.prevent="onKeydownRight(ind)"
          @keydown.down.self.prevent="onKeydownDown(ind)"
          @keydown="onHeaderCellKeydown($event, ind)"
        >
          <div :ref="`mainHeader-${ind}`" class="main-header">
            <ArrowIcon :class="['icon', { active: sortColumn === ind }]" />
            <div class="header-text-container" :title="header">
              <span :ref="`headerText-${ind}`">{{ header }}</span>
            </div>
          </div>
          <div v-if="columnSubHeaders[ind]" class="sub-header-text-container">
            <slot
              name="subHeader"
              :sub-header="columnSubHeaders[ind]"
              :column-index="ind"
              >{{ columnSubHeaders[ind] }}</slot
            >
          </div>
        </div>
        <div v-if="columnDeletables[ind]" class="delete-column-button">
          <KdsButton
            variant="transparent"
            leading-icon="trash"
            size="small"
            aria-label="Delete column"
            @click.stop="onDeleteColumn(ind)"
          />
        </div>
        <div v-if="columnSubMenuItems[ind]" class="sub-menu-select-header">
          <SubMenu
            ref="subMenu"
            :items="columnSubMenuItems[ind]!"
            orientation="left"
            :max-menu-width="maximumSubMenuWidth"
            allow-overflow-main-axis
            button-title="Open table column header submenu"
            @item-click="
              (_: Event, item: any) => {
                onSubMenuItemSelection(item, ind);
              }
            "
          >
            <ArrowDropdown class="icon" />
          </SubMenu>
        </div>
        <div
          v-if="enableColumnResizing"
          :class="[
            'drag-handle',
            { hover: hoverIndex === ind, drag: dragIndex === ind },
          ]"
          :style="{
            height: `${dragHandleHeight(dragIndex === ind)}px`,
            width: `${currentResizeDragHandleWidth}px`,
          }"
          @pointerover="onPointerOver($event, ind)"
          @pointerleave="onPointerLeave"
          @pointerdown.passive="onPointerDown($event as any, ind)"
          @pointerup.passive="onPointerUp($event)"
          @pointermove="onPointerMove"
          @lostpointercapture="onLostPointerCapture"
        />
      </th>
      <th
        v-if="tableConfig.showColumnFilters"
        :class="['action', { 'filter-active': filtersActive }]"
      >
        <FunctionButton @click="onToggleFilter">
          <FilterIcon />
        </FunctionButton>
      </th>
      <th
        v-if="showNewColumnButton"
        ref="new-column-button-head"
        class="new-column-head"
        @vue:mounted="emitNewColumnButtonWidth"
      >
        <KdsButton
          ref="new-column-button"
          label="Add"
          leading-icon="plus"
          size="small"
          @click="onNewColumnButtonClick"
          @keydown.left.prevent.stop="onNewColumnButtonKeydownLeft"
        />
      </th>
    </tr>
    <div
      v-if="headerSelectionOverlayStyle"
      class="header-selection-overlay"
      :class="{ 'header-focused': focusedHeaderIndex !== null }"
      :style="headerSelectionOverlayStyle"
    />
  </thead>
</template>

<style lang="postcss" scoped>
thead {
  height: 41px;
  background-color: var(--knime-porcelain);

  & tr {
    display: flex;
    height: 100%;
    transition:
      height 0.3s,
      box-shadow 0.15s;
    border-top: var(--border-top) solid var(--knime-silver-sand-semi);

    & th {
      white-space: nowrap;
      overflow: visible;
      text-overflow: ellipsis;
      line-height: 40px;
      padding: 0;
      text-align: left;

      &.with-subheaders {
        line-height: 42px;
      }

      &.collapser-cell-spacer {
        min-width: 30px;
      }

      &.deletion-cell-spacer {
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
        position: sticky;
        right: 0;
        background-color: var(--knime-porcelain);
        align-items: center;
        display: flex;
        overflow: visible;
        min-width: 30px;

        & :deep(.function-button) {
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
          background-color: var(--knime-silver-sand);

          & :deep(.function-button) {
            & svg {
              fill: var(--knime-masala);
              stroke: var(--knime-masala);
            }
          }
        }
      }

      &.colored-header {
        background-size: 4px calc(100% - 1px);
        background-repeat: no-repeat;
        background-position: 10px 0;
        background-image: linear-gradient(
          90deg,
          var(--data-cell-color),
          var(--data-cell-color)
        );
      }

      &.column-header {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        & .column-header-content {
          display: flex;
          justify-content: center;
          flex-direction: column;
          width: 100%;

          &:focus {
            outline: none;
          }

          &.with-button-in-header {
            width: calc(
              100% - 22px
            ); /* due to .sub-menu-select-header / .delete-column-button: width */
          }

          &:not(.inverted) .icon.active {
            transform: scaleY(-1);
          }

          & .main-header {
            display: flex;
            flex-direction: row-reverse;
            justify-content: flex-end;

            & .header-text-container {
              max-width: calc(100%);
              overflow: hidden;
              text-overflow: ellipsis;
              font-weight: 700;
              line-height: 16px;
              font-size: 13px;
            }

            & .icon {
              min-width: 13px; /* needs to be set such that the icon does not shrink when shrinkig the column width */
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
          }

          & .sub-header-text-container {
            font-weight: 400;
            font-size: 10px;
            line-height: 12px;
            font-style: italic;
            stroke-width: calc(32px / 13);
            overflow: hidden;
            text-overflow: ellipsis;
          }

          &.sortable {
            cursor: pointer;

            &:hover,
            &:focus {
              outline: none;
              color: var(--knime-dove-gray);

              & .main-header {
                & .icon {
                  display: unset;
                  stroke: var(--knime-dove-gray);
                }
              }
            }
          }
        }

        & .delete-column-button {
          width: 22px;
          display: flex;
          align-items: center;
        }

        & .sub-menu-select-header {
          width: 22px;
          display: flex;
          align-items: center;
          position: relative;
          right: 5px;

          & :deep(.submenu-toggle) {
            padding: 4px;

            & svg {
              height: 14px;
              width: 14px;
            }
          }
        }

        & .drag-handle {
          position: absolute;
          background-color: var(--knime-dove-gray);
          right: 0;
          opacity: 0;
          cursor: col-resize;

          &.hover {
            opacity: 1;
          }

          &.drag {
            /* otherwise the handle will be behind rows when virtual scrolling */
            z-index: var(--z-index-column-resize-drag-handle);
            width: 1px;
            opacity: 1;
          }
        }
      }

      &.new-column-head {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 8px;
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

.header-selection-overlay {
  --selected-cells-background-color: rgb(30 109 168 / 9%);
  --selected-cells-border: 1px solid rgb(55 109 168);

  position: absolute;
  top: 0;
  height: 100%;
  background-color: var(--selected-cells-background-color);
  border: var(--selected-cells-border);
  pointer-events: none;
  z-index: 1;

  &.header-focused::after {
    --focus-cell-border: 1px dashed rgb(44 88 135);

    content: "";
    position: absolute;
    inset: 2px;
    border: var(--focus-cell-border);
  }
}
</style>
