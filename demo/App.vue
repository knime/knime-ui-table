<script>
import Table from '../src/components/Table.vue';
import demoProps from './props.json';

export default {
    components: {
        Table
    },
    data() {
        return {
            tableProps: Object.freeze(demoProps)
        };
    }
};
</script>

<template>
  <div>
    <h2>
      KNIME UI TABLE
    </h2>
    <Table v-bind="tableProps" />
  </div>
</template>

<style>
  @import './index.css';
</style>
