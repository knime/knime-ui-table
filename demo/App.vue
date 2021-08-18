<script>
import Table from '../src/components/Table.vue';
import demoProps from './props.js';

export default {
    components: {
        Table
    }    
}
</script>

<template>
    <Table v-bind="demoProps" />
</template>