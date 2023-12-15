<script setup lang="ts">
import { ref } from "vue";
import useDropdownFloating from "../../composables/useDropdownFloating";

const props = defineProps({
  openUp: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const referenceElement = ref<HTMLElement | null>(null);
const floatingElement = ref<HTMLElement | null>(null);

const { update, floatingStyles, placement } = useDropdownFloating(
  referenceElement,
  floatingElement,
  props.openUp,
);

defineExpose({
  update,
  floatingStyles,
  placement,
  floatingElement,
  referenceElement,
});
</script>

<template>
  <div id="toggle" ref="referenceElement" />
  <div id="popover" ref="floatingElement" :style="floatingStyles" />
</template>
