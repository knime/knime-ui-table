<script>
import Table from '../components/Table.vue';
import demoProps from './props.json';
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox.vue';
import DeleteIcon from '~/webapps-common/ui/assets/img/icons/trash.svg?inline';
import LinkIcon from '~/webapps-common/ui/assets/img/icons/link.svg?inline';

const allColumnSpecificSortConfigs = [true, true, false, false, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true];

const subMenuItems = [
    {
        name: 'delete',
        text: 'Delete',
        icon: DeleteIcon,
        callback: (row, context) => {
            consola.debug(`Delete called with row ${row}`, context);
        }
    },
    {
        name: 'copy',
        text: 'Copy link',
        icon: LinkIcon,
        callback: (row, context) => {
            consola.debug(`Copy link called with row ${row}`, context);
        }
    }
];

const groupSubMenuItems = [{
    name: 'delete',
    text: 'Delete all',
    icon: DeleteIcon,
    callback: (row, context) => {
        consola.debug(`Group delete all called with row ${row}`, context);
    }
}];

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
            allColumnSpecificSortConfigs: [],
            setInitialSorting: false,
            setInitialFiltering: false
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
                allColumnSpecificSortConfigs: this.allColumnSpecificSortConfigs,
                ...this.setInitialSorting ? { defaultSortColumn: 1 } : {},
                ...this.setInitialSorting ? { defaultSortColumnDirection: 1 } : {},
                ...this.setInitialFiltering ? { initialFilterValues: { user: ['example-user2'] } } : {}
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
        onDisableSortOfSpecificColumns(checked) {
            this.allColumnSpecificSortConfigs = checked ? allColumnSpecificSortConfigs : [];
        },
        forceRerender() {
            this.renderComponent = false;

            this.$nextTick(() => {
                this.renderComponent = true;
            });
        }
    }
};
</script>

<template>
  <div class="flex-wrapper">
    <h2>
      KNIME UI TABLE
    </h2>
    <div class="toggle-options">
      <h6>
        Enable:
      </h6>
      <Checkbox v-model="showTimeFilter">time filter</Checkbox>
      <Checkbox v-model="showColumnSelection">column selection</Checkbox>
      <Checkbox v-model="showGroupBy">group by</Checkbox>
      <Checkbox v-model="showColumnFilters">column filters</Checkbox>
      <Checkbox
        v-model="setInitialFiltering"
        :disabled="!showColumnFilters"
        @input="forceRerender"
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
        @input="forceRerender"
      >
        set default sorting
      </Checkbox>
      <Checkbox v-model="showPopovers">popovers</Checkbox>
      <Checkbox v-model="compactMode">compact mode</Checkbox>
      <Checkbox @input="onDisableSortOfSpecificColumns">
        disable sort of specific columns (here: columns starting with workflow)
      </Checkbox>
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
  @import './index.css';

  body {
    background-color: var(--knime-silver-sand-semi);
    padding: 12px;
  }

  .flex-wrapper {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 24px); /* 2 * -12px due to body padding of 12px */
    overflow: hidden;
  }

  .flex-wrapper h2 {
    margin-bottom: 0;
  }

  .flex-wrapper .wrapper {
    flex-basis: content;
  }

  .flex-wrapper button {
    align-self: flex-start;
  }

  .toggle-options > label.checkbox {
    padding-right: 12px;
  }
</style>
