<script>
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import ArrowIcon from '~/webapps-common/ui/assets/img/icons/arrow-down.svg?inline';
import FilterIcon from '~/webapps-common/ui/assets/img/icons/filter.svg?inline';

const MIN_COLUMN_SIZE = 30;

/**
 * A table header element for displaying the column names in a table. This component
 * has a filter-toggle button to programmatically display column filters, a checkbox
 * for selecting all rows in the table and listens for clicks on the individual column
 * headers to allow sorting.
 *
 * @emits headerSelect event when the checkbox is selected for table-wide toggling of selection.
 * @emits columnSort event when a column name is clicked to trigger sorting.
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
        isSelected: {
            type: Boolean,
            default: false
        },
        filtersActive: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            height: 40,
            hoverIndex: null, // the index of the column that is currently being hovered over; null during resize
            dragIndex: null, // the index of the column that is currently being dragged / resized
            columnSizeOnDragStart: null, // the original width of the column that is currently being resized
            pageXOnDragStart: null // the x coordinate at which the mouse was clicked when starting the resize drag
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
        onSelect() {
            this.$emit('headerSelect', !this.isSelected);
        },
        onHeaderClick(ind) {
            if (this.enableSorting) {
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
                // while it would be a cleaner solution to set the cursor via css, we want to keep the resize cursor
                // even when dragging outside this component
                document.body.style.cursor = 'col-resize';
            }
        },
        onPointerLeave(event) {
            consola.debug('End hover over drag handle: ', event);
            if (this.dragIndex === null) {
                this.hoverIndex = null;
                document.body.style.cursor = 'auto';
            }
        },
        onPointerDown(event, columnIndex) {
            consola.debug('Resize via drag triggered: ', event);
            // prevent default browser behavior
            event.preventDefault();
            // stop the event from propagating up the DOM tree
            event.stopPropagation();
            // capture move events until the pointer is released
            event.target.setPointerCapture?.(event.pointerId);
            this.dragIndex = columnIndex;
            this.columnSizeOnDragStart = this.columnSizes[columnIndex];
            this.pageXOnDragStart = event.pageX;
            this.$emit('showColumnBorder', this.dragIndex);
        },
        onPointerMove(event) {
            consola.debug('Resize via drag ongoing: ', event);
            const newColumnSize = this.columnSizeOnDragStart + event.pageX - this.pageXOnDragStart;
            this.$emit('columnResize', this.dragIndex, Math.max(newColumnSize, MIN_COLUMN_SIZE));
        },
        onPointerUp(event) {
            consola.debug('Resize via drag finished: ', event);
            this.dragIndex = null;
            this.$emit('hideColumnBorder');
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
          :value="isSelected"
          @input="onSelect"
        />
      </th>
      <th
        v-for="(header, ind) in columnHeaders"
        :key="ind"
        :style="{ width: `calc(${columnSizes[ind] || 100}px)`}"
        :class="['column-header', { sortable: enableSorting, inverted: sortDirection === -1},
                 {'with-subheaders': hasSubHeaders}]"
        tabindex="0"
        @mousedown="onHeaderClick(ind)"
        @keydown.space="onHeaderClick(ind)"
      >
        <div class="column-header-content">
          <div class="main-header">
            <ArrowIcon :class="['icon', { active: sortColumn === ind }]" />
            <div :class="['header-text-container', { 'with-icon': sortColumn === ind }]">
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
          :class="['drag-handle', { hover: hoverIndex === ind, drag: dragIndex === ind}]"
          @pointerover="onPointerOver($event, ind)"
          @pointerleave="onPointerLeave"
          @pointerdown="onPointerDown($event, ind)"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
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
      &.with-subheaders {
        line-height: 42px;
      }
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
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-end;
        margin-left: 10px;

        & .column-header-content {
          display: flex;
          justify-content: center;
          flex-direction: column;
          width: 100%;

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
          }

          & .sub-header-text-container {
            font-weight: 400;
            font-size: 10px;
            line-height: 12px;
            font-style: italic;
            stroke-width: calc(32px / 13);
            display: flex;
          }
        }

        & .drag-handle {
          position: absolute;
          background-color: var(--knime-dove-gray);
          right: 0;
          height: 100%;
          width: 5px;
          opacity: 0;

          &.hover {
            opacity: 1;
          }

          &.drag {
            width: 1px;
            opacity: 1;
          }
        }

        &:not(.inverted) .icon.active {
          transform: scaleY(-1);
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
