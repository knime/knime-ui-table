<script>
import { markRaw } from 'vue';
import Checkbox from 'webapps-common/ui/components/forms/Checkbox.vue';
import DeleteIcon from 'webapps-common/ui/assets/img/icons/trash.svg';
import LinkIcon from 'webapps-common/ui/assets/img/icons/link.svg';
import TeamGroupAdmin from 'webapps-common/ui/assets/img/icons/team-group-admin.svg';

import Table from '@/components/Table.vue';
import demoProps from './props.json';

const numberOfColumns = 19;

const allColumnSpecificSortConfigs = [true, true, false, false, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true];

const subMenuItems = [
    {
        name: 'delete',
        text: 'Delete',
        icon: markRaw(DeleteIcon),
        callback: (row, context) => {
            consola.debug(`Delete called with row ${row}`, context);
        }
    },
    {
        name: 'copy',
        text: 'Copy link',
        icon: markRaw(LinkIcon),
        callback: (row, context) => {
            consola.debug(`Copy link called with row ${row}`, context);
        }
    },
    {
        name: 'manage',
        text: 'Manage access',
        icon: markRaw(TeamGroupAdmin),
        hideOn: (row, data) => {
            consola.debug(`hideOn function called with ${row}`, data);
            const propability = 0.5;
            return Math.random() > propability;
        }
    }
];

const groupSubMenuItems = [{
    name: 'delete',
    text: 'Delete all',
    icon: markRaw(DeleteIcon),
    callback: (row, context) => {
        consola.debug(`Group delete all called with row ${row}`, context);
    }
}];

const headerSubMenuItems = new Array(numberOfColumns).fill([
    { text: 'Section1', sectionHeadline: true, separator: true },
    { text: 'Item 1', id: 's1i1', selected: true, section: 'section1' },
    { text: 'Item 2', id: 's1i2', selected: false, section: 'section1' },
    { text: 'Section2', sectionHeadline: true, separator: true },
    { text: 'Item 1', id: 's2i1', selected: true, section: 'section2' },
    { text: 'Item 2', id: 's2i2', selected: false, section: 'section2' }
]);

export default {
    components: {
        Table,
        Checkbox
    },
    data() {
        return {
            renderComponent: true,
            subMenuItems,
            groupSubMenuItems,
            showTimeFilter: true,
            showColumnSelection: true,
            showGroupBy: true,
            showColumnFilters: true,
            showSearch: true,
            showBottomControls: true,
            showCollapser: true,
            showSelection: true,
            showSorting: true,
            showPopovers: true,
            compactMode: true,
            showActionButton: false,
            enableVirtualScrolling: false,
            headerSubMenuItems: [],
            allColumnSpecificSortConfigs: [],
            setInitialSorting: false,
            setInitialFiltering: false,
            fitToWindow: false,
            autoSizeColumnsToContent: true,
            autoSizeColumnsToContentInclHeaders: false
        };
    },
    computed: {
        tableProps() {
            return {
                ...demoProps,
                subMenuItems: this.subMenuItems,
                groupSubMenuItems: this.groupSubMenuItems,
                showTimeFilter: this.showTimeFilter,
                showColumnSelection: this.showColumnSelection,
                showGroupBy: this.showGroupBy,
                showColumnFilters: this.showColumnFilters,
                showSearch: this.showSearch,
                showBottomControls: this.showBottomControls,
                showCollapser: this.showCollapser,
                showSelection: this.showSelection,
                showSorting: this.showSorting,
                showPopovers: this.showPopovers,
                compactMode: this.compactMode,
                showActionButton: this.showActionButton,
                headerSubMenuItems: this.headerSubMenuItems,
                allColumnSpecificSortConfigs: this.allColumnSpecificSortConfigs,
                enableVirtualScrolling: this.enableVirtualScrolling,
                ...this.setInitialSorting ? { defaultSortColumn: 1 } : {},
                ...this.setInitialSorting ? { defaultSortColumnDirection: 1 } : {},
                ...this.setInitialFiltering ? { initialFilterValues: { user: ['example-user2'] } } : {},
                autoSizeColumnsToContent: this.autoSizeColumnsToContent,
                autoSizeColumnsToContentInclHeaders: this.autoSizeColumnsToContentInclHeaders
            };
        }
    },
    watch: {
        showColumnFilters(showColumnFilters) {
            if (!showColumnFilters) {
                this.setInitialFiltering = false;
            }
        }
    },
    methods: {
        printConfig() {
            consola.log('TableUI DataConfig prop:', this.$refs?.knimeTable.dataConfig);
            consola.log('TableUI TableConfig prop:', this.$refs?.knimeTable.tableConfig);
        },
        onShowHeaderSubMenu(event) {
            this.headerSubMenuItems = event.target.checked ? headerSubMenuItems : [];
        },
        onDisableSortOfSpecificColumns(event) {
            this.allColumnSpecificSortConfigs = event.target.checked ? allColumnSpecificSortConfigs : [];
        },
        forceRerender() {
            this.renderComponent = false;

            this.$nextTick(() => {
                this.renderComponent = true;
            });
        },
        forceScrollerUpdate() {
            this.$refs.knimeTable.$refs.tableUI.refreshScroller();
        }
    }
};
</script>

<template>
  <div :class="['demo',{'fit-to-window': fitToWindow}]">
    <h2>
      KNIME UI TABLE
    </h2>
    <div class="toggle-options">
      <Checkbox v-model="showTimeFilter">time filter</Checkbox>
      <Checkbox v-model="showColumnSelection">column selection</Checkbox>
      <Checkbox v-model="showGroupBy">group by</Checkbox>
      <Checkbox v-model="showColumnFilters">column filters</Checkbox>
      <Checkbox
        v-model="setInitialFiltering"
        :disabled="!showColumnFilters"
        @update:model-value="forceRerender"
      >
        set initial filters
      </Checkbox>
      <Checkbox v-model="showSearch">search</Checkbox>
      <Checkbox v-model="showBottomControls">bottom controls</Checkbox>
      <Checkbox v-model="showCollapser">collapser</Checkbox>
      <Checkbox v-model="showSelection">selection</Checkbox>
      <Checkbox v-model="showSorting">sort</Checkbox>
      <Checkbox
        v-model="setInitialSorting"
        @update:model-value="forceRerender"
      >
        set default sorting
      </Checkbox>
      <Checkbox v-model="showPopovers">popovers</Checkbox>
      <Checkbox
        v-model="compactMode"
        @update:model-value="forceScrollerUpdate"
      >
        compact mode
      </Checkbox>
      <Checkbox v-model="enableVirtualScrolling">virtual scrolling</Checkbox>
      <Checkbox @input="onShowHeaderSubMenu">header sub menu settings</Checkbox>
      <Checkbox @input="onDisableSortOfSpecificColumns">
        disable sort of specific columns (here: columns starting with workflow)
      </Checkbox>
      <Checkbox v-model="fitToWindow">Fit table inside the current window</Checkbox>
      <Checkbox v-model="autoSizeColumnsToContent">Auto size columns to content</Checkbox>
      <Checkbox v-model="autoSizeColumnsToContentInclHeaders">Auto size including headers</Checkbox>
    </div>
    <br>
    <Table
      v-if="renderComponent"
      ref="knimeTable"
      v-bind="tableProps"
    >
      <template #collapserContent="{ row }">
        <h6>Example collapser slot:</h6>
        <pre>
          {{ JSON.stringify(row, null, 4) }}
        </pre>
      </template>
    </Table>
    <br>
    <button @click="printConfig">Print TableUI config to console</button>
  </div>
</template>

<style>
  @import url("webapps-common/ui/css");

  :root {
    font-size: 16px;
    line-height: 1.44;
  }

  body {
    background-color: var(--knime-porcelain);
    padding: 12px;
  }

  .fit-to-window {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 24px); /* 2 * -12px due to body padding of 12px */
    overflow: visible;
  }

  .fit-to-window .table {
      flex-grow: 1;
    }

  .demo h2 {
    margin-bottom: 0;
  }

  .demo button {
    align-self: flex-start;
  }

  .toggle-options > label.checkbox {
    padding-right: 12px;
  }
</style>
