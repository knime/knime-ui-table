<script>
import Table from '../components/Table.vue';
import demoProps from './props.json';
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox.vue';
import DeleteIcon from '~/webapps-common/ui/assets/img/icons/trash.svg?inline';
import LinkIcon from '~/webapps-common/ui/assets/img/icons/link.svg?inline';

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
            showActionButton: false,
            ...demoProps
        };
    },
    methods: {
        printConfig() {
            consola.log('TableUI DataConfig prop:', this.$refs?.knimeTable.dataConfig);
            consola.log('TableUI TableConfig prop:', this.$refs?.knimeTable.tableConfig);
        }
    }
};
</script>

<template>
  <div>
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
      <Checkbox v-model="showSearch">search</Checkbox>
      <Checkbox v-model="showBottomControls">bottom controls</Checkbox>
      <Checkbox v-model="showCollapser">collapser</Checkbox>
      <Checkbox v-model="showSelection">selection</Checkbox>
      <Checkbox v-model="showSorting">sort</Checkbox>
      <Checkbox v-model="showPopovers">popovers</Checkbox>
    </div>
    <br>
    <Table
      ref="knimeTable"
      v-bind="_data"
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

  .toggle-options > label.checkbox {
    padding-right: 12px;
  }
</style>
