<script>
import CollapserToggle from '../ui/CollapserToggle.vue';
import SubMenu from '~/webapps-common/ui/components/SubMenu.vue';
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox.vue';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton.vue';
import OptionsIcon from '~/webapps-common/ui/assets/img/icons/menu-options.svg?inline';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';
import CircleHelpIcon from '~/webapps-common/ui/assets/img/icons/circle-help.svg?inline';
import { DEFAULT_ROW_HEIGHT } from '../../util/constants';

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
        CircleHelpIcon
    },
    props: {
        /**
         * rowData contains the data that is passed on by the overlying repeater in the table. In contrast to the row
         * property rowData contains the complete set and not just the part that is displayed per column.
         */
        rowData: {
            type: Object,
            default: () => ({})
        },
        /**
         * row contains contains the elements that are rendered per column into the row. this represents a subset of rowData.
         */
        row: {
            type: Array,
            default: () => []
        },
        tableConfig: {
            type: Object,
            default: () => ({})
        },
        columnConfigs: {
            type: Array,
            default: () => []
        },
        rowConfig: {
            type: Object,
            default: () => ({})
        },
        rowHeight: {
            type: Number,
            default: DEFAULT_ROW_HEIGHT
        },
        isSelected: {
            type: Boolean,
            default: false
        },
        showBorderColumnIndex: {
            type: Number,
            default: null
        },
        marginBottom: {
            type: Number,
            default: 0
        },
        showSubMenu: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showContent: false
        };
    },
    computed: {
        columnKeys() {
            return this.getPropertiesFromColumns('key');
        },
        columnSizes() {
            return this.getPropertiesFromColumns('size');
        },
        formatters() {
            return this.getPropertiesFromColumns('formatter');
        },
        classGenerators() {
            return this.getPropertiesFromColumns('classGenerator');
        },
        slottedColumns() {
            return this.getPropertiesFromColumns('hasSlotContent');
        },
        clickableColumns() {
            // enforce boolean to reduce reactivity
            return this.getPropertiesFromColumns('popoverRenderer').map(config => Boolean(config));
        },
        classes() {
            return this.row.map((item, ind) => this.classGenerators[ind]?.map(classItem => {
                if (typeof classItem === 'function') {
                    return classItem(item);
                }
                if (typeof classItem === 'object') {
                    return classItem[item];
                }
                return classItem;
            }));
        },
        filteredSubMenuItems() {
            const defaultSubMenuItems = this.tableConfig.subMenuItems.filter(item => {
                if (typeof item.hideOn === 'function') {
                    return !item.hideOn(this.row, this.rowData);
                }
                return true;
            });

            return this.rowData.data?.subMenuItemsForRow?.length
                ? this.rowData.data?.subMenuItemsForRow
                : defaultSubMenuItems;
        }
    },
    mounted() {
        // Reverts emited event if component is not ready
        this.$emit('rowExpand', this.showContent);
    },
    methods: {
        getPropertiesFromColumns(key) {
            return this.columnConfigs.map(colConfig => colConfig[key]);
        },
        onRowExpand() {
            this.showContent = !this.showContent;
            this.$nextTick(() => this.$emit('rowExpand', this.showContent));
        },
        onSelect(value) {
            this.$emit('rowSelect', value);
        },
        onCellClick(event) {
            if (event?.clickable) {
                this.$emit('rowInput', {
                    ...event,
                    type: 'click',
                    cell: this.$refs.dataCell[event.colInd],
                    value: null
                });
            }
        },
        onInput(val, ind) {
            this.$emit('rowInput', { type: 'input', cell: this.$refs.dataCell[ind], value: val });
        },
        onSubMenuItemClick(event, clickedItem) {
            this.$emit('rowSubMenuClick', clickedItem);
            if (clickedItem.callback) {
                event.preventDefault();
                return false;
            }
            return true;
        },
        isClickable(data, ind) {
            if (!this.tableConfig.showPopovers || !data || data === '-' || !this.clickableColumns[ind]) {
                return false;
            }
            return true;
        }
    }
};
</script>

<template>
  <span>
    <tr
      v-if="row.length > 0"
      :class="['row', {
        'no-sub-menu': !filteredSubMenuItems.length,
        'compact-mode': rowConfig.compactMode
      }]"
      :style="{height: `${rowHeight}px`, marginBottom: `${marginBottom}px`}"
    >
      <CollapserToggle
        v-if="tableConfig.showCollapser"
        :expanded="showContent"
        :compact-mode="rowConfig.compactMode"
        class="collapser-cell"
        @collapserExpand="onRowExpand"
      />
      <td
        v-if="tableConfig.showSelection"
        class="select-cell"
      >
        <Checkbox
          :value="isSelected"
          @input="onSelect"
        />
      </td>
      <td
        v-for="(data, ind) in row"
        ref="dataCell"
        :key="ind"
        :class="[classes[ind], 'data-cell',
                 { clickable: isClickable(data, ind) }]"
        :style="{ width: `calc(${columnSizes[ind]|| 100}px)` }"
        :title="!isClickable(data, ind) ? data : null"
        @click="event => onCellClick({ event, colInd: ind, data, clickable: isClickable(data, ind) })"
        @input="(val) => onInput(val, ind)"
      >
        <CircleHelpIcon
          v-if="data === null"
          class="missing-value-icon"
        />
        <slot
          v-else-if="slottedColumns[ind]"
          :name="`cellContent-${columnKeys[ind]}`"
          :row="row"
          :ind="ind"
        />
        <span v-else>
          {{ formatters[ind](data) }}
        </span>
      </td>
      <td
        v-if="filteredSubMenuItems.length || showSubMenu"
        button-title="actions"
        class="action"
      >
        <SubMenu
          v-if="filteredSubMenuItems.length"
          :items="filteredSubMenuItems"
          button-title="actions"
          @item-click="onSubMenuItemClick"
        >
          <OptionsIcon />
        </SubMenu>
      </td>
    </tr>
    <tr
      v-else
      class="row empty-row"
    >
      <td>
        -
      </td>
    </tr>
    <tr
      v-if="showContent"
      class="collapser-row"
    >
      <td class="expandable-content">
        <FunctionButton
          class="collapser-button"
          @click="onRowExpand"
        >
          <CloseIcon />
        </FunctionButton>
        <slot name="rowCollapserContent" />
      </td>
    </tr>
  </span>
</template>

<style lang="postcss" scoped>

tr.row {
  transition: height 0.3s, box-shadow 0.15s;
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

      & >>> label {
        padding: 0;
        display: inline;
        max-width: unset;
        bottom: 3px;
        left: 8px;
      }
    }

    &.data-cell {
      margin-left: 10px;

      & .missing-value-icon {
        vertical-align: middle;
        width: 14px;
        height: 14px;
        stroke-width: calc(32px / 14);
        stroke: var(--theme-color-kudos);
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

      & >>> ul {
        margin-top: -10px;
        right: 10px;
      }

      & >>> .submenu-toggle {
        display: flex;
        align-self: stretch;
        align-items: center;
        height: 40px;
        width: 30px;
        border-radius: 0;
        transition: background-color 0.15s;
      }
    }

    &.clickable {
      cursor: pointer;
      color: var(--knime-dove-gray);

      &:hover {
        color: var(--knime-masala);
      }
    }
  }

  &.compact-mode {
    & td {
      line-height: 24px;

      & >>> label {
        bottom: 5px;
      }

      &.action >>> .submenu-toggle {
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
  padding: 30px 50px 20px 50px;
  margin-bottom: 2px;
  position: relative;

  & td.expandable-content {
    & .collapser-button {
      position: absolute;
      right: 50px;
      top: 20px;
      height: 24px;
      width: 24px;
      padding: 3px;
      z-index: 1;

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
