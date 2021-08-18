<script>
import Table from '../src/components/Table.vue';
import demoProps from './props.js';

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
  <Table v-bind="tableProps" />
</template>
