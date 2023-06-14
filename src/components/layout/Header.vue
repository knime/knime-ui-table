<script>
import Checkbox from 'webapps-common/ui/components/forms/Checkbox.vue';
import FunctionButton from 'webapps-common/ui/components/FunctionButton.vue';
import SubMenu from 'webapps-common/ui/components/SubMenu.vue';
import ArrowDropdown from 'webapps-common/ui/assets/img/icons/arrow-dropdown.svg';
import ArrowIcon from 'webapps-common/ui/assets/img/icons/arrow-down.svg';
import FilterIcon from 'webapps-common/ui/assets/img/icons/filter.svg';
import throttle from 'raf-throttle';
import { MIN_COLUMN_SIZE, HEADER_HEIGHT, MAX_SUB_MENU_WIDTH } from '@/util/constants';

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
        columnSubHeaders: {
            type: Array,
            default: () => []
        },
        columnSizes: {
            type: Array,
            default: () => []
        },
        columnSortConfigs: {
            type: Array,
            default: () => []
        },
        columnSubMenuItems: {
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
        getDragHandleHeight: {
            type: Function,
            default: () => HEADER_HEIGHT
        }
    },
    emits: [
        'headerSelect',
        'columnSort',
        'toggleFilter',
        'showColumnBorder',
        'columnResize',
        'hideColumnBorder',
        'subMenuItemSelection',
        'columnResizeEnd',
        'columnResizeStart', 'allColumnsResize'
    ],
    data() {
        return {
            height: 40,
            hoverIndex: null, // the index of the column that is currently being hovered over; null during resize
            dragIndex: null, // the index of the column that is currently being dragged / resized
            columnSizeOnDragStart: null, // the original width of the column that is currently being resized
            pageXOnDragStart: null, // the x coordinate at which the mouse was clicked when starting the resize drag
            minimumColumnWidth: MIN_COLUMN_SIZE, // need to add this here since it is referenced in the template
            maximumSubMenuWidth: MAX_SUB_MENU_WIDTH,
            currentDragHandlerHeight: 0
        };
    },
    computed: {
        enableSorting() {
            // do not enable sorting when currently resizing or hovering over a drag handle
            return Boolean(this.tableConfig?.sortConfig) && this.hoverIndex === null && this.dragIndex === null;
        },
        sortColumn() {
            return this.tableConfig?.sortConfig?.sortColumn;
        },
        sortDirection() {
            return this.tableConfig?.sortConfig?.sortDirection;
        },
        hasSubHeaders() {
            return this.columnSubHeaders.some(item => item);
        }
    },
    methods: {
        isColumnSortable(index) {
            return this.enableSorting && this.columnSortConfigs[index];
        },
        onSelect() {
            this.$emit('headerSelect', !this.isSelected);
        },
        onHeaderClick(ind) {
            if (this.isColumnSortable(ind)) {
                this.$emit('columnSort', ind, this.columnHeaders[ind]);
            }
        },
        onToggleFilter() {
            this.$emit('toggleFilter');
        },
        onPointerOver(event, columnIndex) {
            consola.debug('Begin hover over drag handle: ', event);
            if (this.dragIndex === null) {
                this.hoverIndex = columnIndex;
            }
        },
        onPointerLeave(event) {
            consola.debug('End hover over drag handle: ', event);
            if (this.dragIndex === null) {
                this.hoverIndex = null;
            }
        },
        onPointerDown(event, columnIndex) {
            consola.debug('Resize via drag triggered: ', event);
            // stop the event from propagating up the DOM tree
            event.stopPropagation();
            // capture move events until the pointer is released
            event.target.setPointerCapture(event.pointerId);
            this.dragIndex = columnIndex;
            this.currentDragHandlerHeight = this.getDragHandleHeight();
            this.columnSizeOnDragStart = this.columnSizes[columnIndex];
            this.pageXOnDragStart = event.pageX;
            this.$emit('columnResizeStart');
        },
        onPointerUp(event) {
            this.$emit('columnResizeEnd');
            if (this.dragIndex !== null && event.shiftKey) {
                const newColumnSize = this.columnSizeOnDragStart + event.pageX - this.pageXOnDragStart;
                this.$emit('allColumnsResize', Math.max(newColumnSize, this.minimumColumnWidth));
            }
        },
        onPointerMove: throttle(function (event) {
            /* eslint-disable no-invalid-this */
            if (this.dragIndex !== null) {
                consola.debug('Resize via drag ongoing: ', event);
                const newColumnSize = this.columnSizeOnDragStart + event.pageX - this.pageXOnDragStart;
                this.$emit('columnResize', this.dragIndex, Math.max(newColumnSize, this.minimumColumnWidth));
            }
            /* eslint-enable no-invalid-this */
        }),
        /* The lostpointercapture event is triggered if the pointer capture is lost for any reason, including its
        orderly release via a pointerup event. Because the onPointerMove function is throttled we also need to throttle
        the onLostPointerCapture function to guarantee order of event handling. */
        onLostPointerCapture: throttle(function (event) {
            /* eslint-disable no-invalid-this */
            consola.debug('Resize via drag finished: ', event);
            this.dragIndex = null;
            /* Also have to reset hoverIndex since we might no longer be hovering over the drag handle */
            this.hoverIndex = null;
            /* eslint-enable no-invalid-this */
        }),
        dragHandleHeight(isDragging) {
            return isDragging ? this.currentDragHandlerHeight : HEADER_HEIGHT;
        },
        onSubMenuItemSelection(item, ind) {
            this.$emit('subMenuItemSelection', item, ind);
        }
    }
};
</script>

<template>
  <thead>
    <tr v-if="columnHeaders.length">
      <th
        v-if="tableConfig.showCollapser"
        :cell-type="'th'"
        :class="['collapser-cell-spacer', {'with-subheaders': hasSubHeaders}]"
      />
      <th
        v-if="tableConfig.showSelection"
        :class="['select-cell', {'with-subheaders': hasSubHeaders}]"
      >
        <Checkbox
          :model-value="isSelected"
          @update:model-value="onSelect"
        />
      </th>
      <th
        v-for="(header, ind) in columnHeaders"
        :key="ind"
        :style="{ width: `calc(${columnSizes[ind] || minimumColumnWidth}px)`}"
        class="column-header"
      >
        <div
          class="column-header-content"
          :class="[{ sortable: isColumnSortable(ind), inverted: sortDirection === -1, 'with-subheaders': hasSubHeaders,
                     'with-sub-menu': columnSubMenuItems[ind] }]"
          tabindex="0"
          @click="onHeaderClick(ind)"
          @keydown.space="onHeaderClick(ind)"
        >
          <div class="main-header">
            <ArrowIcon :class="['icon', { active: sortColumn === ind }]" />
            <div
              class="header-text-container"
              :title="header"
            >
              {{ header }}
            </div>
          </div>
          <div
            v-if="columnSubHeaders[ind]"
            class="sub-header-text-container"
          >
            {{ columnSubHeaders[ind] }}
          </div>
        </div>
        <div
          v-if="columnSubMenuItems[ind]"
          class="sub-menu-select-header"
        >
          <SubMenu
            ref="subMenu"
            :items="columnSubMenuItems[ind]"
            orientation="left"
            :max-menu-width="maximumSubMenuWidth"
            allow-overflow-main-axis
            button-title="Open table column header submenu"
            @item-click="(_, item) => { onSubMenuItemSelection(item, ind) }"
          >
            <ArrowDropdown class="icon" />
          </SubMenu>
        </div>
        <div
          :class="['drag-handle', { hover: hoverIndex === ind, drag: dragIndex === ind}]"
          :style="{ height: `${dragHandleHeight(dragIndex === ind)}px`}"
          @pointerover="onPointerOver($event, ind)"
          @pointerleave="onPointerLeave"
          @pointerdown.passive="onPointerDown($event, ind)"
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
    </tr>
    <tr v-else>
      <slot />
    </tr>
  </thead>
</template>

<style lang="postcss" scoped>
thead {
  height: 40px;

  & tr {
    display: flex;
    height: 100%;
    transition: height 0.3s, box-shadow 0.15s;
    border-top: 1px solid var(--knime-silver-sand-semi);

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


      &.column-header {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-left: 10px;

        & .column-header-content {
          display: flex;
          justify-content: center;
          flex-direction: column;
          width: 100%;

          &.with-sub-menu {
            width: calc(100% - 27px); /* due to .sub-menu-select-header: width + padding */
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
              font-size: 14px;
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
          width: 5px;
          opacity: 0;
          cursor: col-resize;

          &.hover {
            opacity: 1;
          }

          &.drag {
            /* otherwise the handle will be behind rows when virtual scrolling */
            z-index: 10;
            width: 1px;
            opacity: 1;
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
