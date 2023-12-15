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

const reference = ref(null);
const floating = ref<HTMLElement | null>(null);

const { update, floatingStyles, placement } = useDropdownFloating(
  reference,
  floating,
  props.openUp,
);

defineExpose({
  update,
  floatingStyles,
  placement,
  floatingElement: floating,
});
</script>

<template>
  <div id="toggle" ref="reference" />
  <div id="popover" ref="floating" :style="floatingStyles" />
</template>
