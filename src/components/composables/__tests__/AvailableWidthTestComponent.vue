<script setup>
import { ref, toRef } from "vue";
import useAvailableWidth from "../useAvailableWidth";

const props = defineProps({
  specialColumnsSizeTotal: {
    type: Number,
    required: true,
  },
});
const root = ref(null);
const scrolledElement = ref(null);
const emit = defineEmits(["availableWidthChanged"]);

const { innerWidthToBodyWidth } = useAvailableWidth({
  refs: {
    root,
    scrolledElement,
  },
  specialColumnsSizeTotal: toRef(props, "specialColumnsSizeTotal"),
  emitAvailableWidth: (width) => emit("availableWidthChanged", width),
});
const useFirstScroller = ref(true);
const refreshScroller = () => {
  useFirstScroller.value = !useFirstScroller.value;
};
defineExpose({
  innerWidthToBodyWidth,
  refreshScroller,
});
</script>

<template>
  <div id="root" ref="root" />
  <div v-if="useFirstScroller" id="scrolledElement" ref="scrolledElement" />
  <div v-else id="scrolledElement2" ref="scrolledElement" />
</template>
