<script setup lang="ts">
import { ref, toRef, type Ref } from "vue";
import useAvailableWidth, { useTotalWidth } from "../useAvailableWidth";

const props = defineProps({
  specialColumnsSizeTotal: {
    type: Number,
    required: true,
  },
  bodyContainsScrollbar: {
    type: Boolean,
    required: false,
    default: false,
  },
});
const root: Ref<null | HTMLElement> = ref(null);
const scrolledElement: Ref<null | HTMLElement> = ref(null);
const emit = defineEmits(["availableWidthChanged"]);

const { innerWidthToBodyWidth, fitsInsideTotalWidth } = useAvailableWidth({
  refs: {
    scrolledElement,
  },
  bodyContainsScrollbar: toRef(props, "bodyContainsScrollbar"),
  specialColumnsSizeTotal: toRef(props, "specialColumnsSizeTotal"),
  emitAvailableWidth: (width) => emit("availableWidthChanged", width),
  totalWidth: useTotalWidth(root),
});
const useFirstScroller = ref(true);
const refreshScroller = () => {
  useFirstScroller.value = !useFirstScroller.value;
};
defineExpose({
  innerWidthToBodyWidth,
  fitsInsideTotalWidth,
  refreshScroller,
});
</script>

<template>
  <div id="root" ref="root" />
  <div v-if="useFirstScroller" id="scrolledElement" ref="scrolledElement" />
  <div v-else id="scrolledElement2" ref="scrolledElement" />
</template>
