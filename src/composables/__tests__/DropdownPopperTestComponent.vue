<script setup lang="ts">
import { ref } from 'vue';
import useDropdownPopper from '../../composables/useDropdownPopper';

const props = defineProps({
    openUp: {
        type: Boolean,
        required: false,
        default: false
    }
});

const toggleRef = ref(null);
const popoverRef = ref(null);

const { updatePopper, popperInstance } = useDropdownPopper(
    { referenceEl: toggleRef, popperTarget: popoverRef },
    props.openUp
);
defineExpose({ updatePopper, popperInstance });
</script>

<template>
  <div
    id="toggle"
    ref="toggleRef"
  />
  <div
    id="popover"
    ref="popoverRef"
  />
</template>
