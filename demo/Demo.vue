<script>
import { markRaw } from 'vue';
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox.vue';
import DeleteIcon from '~/webapps-common/ui/assets/img/icons/trash.svg';
import LinkIcon from '~/webapps-common/ui/assets/img/icons/link.svg';

import Table from '../components/Table.vue';
import demoProps from './props.json';

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
            compactMode: true,
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
  <div :class="{ 'sticky-headers': fixHeader }">
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
      <Checkbox v-model="compactMode">compact mode</Checkbox>
      <Checkbox v-model="fixHeader">fix header</Checkbox>
    </div>
    <br>
    <Table
      ref="knimeTable"
      v-bind="$data"
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

  .sticky-headers {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 24px); /* 2 * -12px due to body padding of 12px */
    overflow: hidden;
  }

  .sticky-headers h2 {
    margin-bottom: 0;
  }

  .sticky-headers .wrapper {
    flex-basis: content;
  }

  .sticky-headers button {
    align-self: flex-start;
  }

  .toggle-options > label.checkbox {
    padding-right: 12px;
  }
</style>
