<script setup>
import { ref, toRef } from 'vue';
import useAvailableWidth from '../useAvailableWidth';

const props = defineProps({
    specialColumnsSizeTotal: {
        type: Number,
        required: true
    }
});
const root = ref(null);
const scrolledElement = ref(null);
const emit = defineEmits(['availableWidthChanged']);

const { innerWidthToBodyWidth } = useAvailableWidth({
    refs: {
        root,
        scrolledElement
    },
    specialColumnsSizeTotal: toRef(props, 'specialColumnsSizeTotal'),
    emitAvailableWidth: (width) => emit('availableWidthChanged', width)
});
defineExpose({ innerWidthToBodyWidth });
</script>

<template>
  <div
    id="root"
    ref="root"
  />
  <div
    id="scrolledElement"
    ref="scrolledElement"
  />
</template>

