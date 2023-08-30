<script setup lang="ts">
import { computed, ref, type Ref } from "vue";
import type { CellProps } from "./CellProps";
import {
  getCellPaddingLeft,
  getColor,
  isMissingValue,
  unpackObjectRepresentation,
} from "@/util";
import CellRenderer from "./CellRenderer.vue";

const emit = defineEmits(["click", "input", "select"]);
const props = defineProps<CellProps>();

const paddingLeft = computed(() => getCellPaddingLeft(props.cellData));

const color = computed(() => getColor(props.cellData));

const isClickable = computed(() => {
  const { cellData, isClickableByConfig } = props;
  return isClickableByConfig && Boolean(cellData) && cellData !== "-";
});

const isMissing = computed(() => isMissingValue(props.cellData));

const formattedValue = computed(() => {
  const { formatter, cellData } = props;
  return formatter(unpackObjectRepresentation(cellData));
});

const title = computed(() => {
  const { cellData } = props;
  if (isMissingValue(cellData)) {
    const missingValueMsg = cellData === null ? "" : ` (${cellData.metadata})`;
    return `Missing Value${missingValueMsg}`;
  }
  if (isClickable.value) {
    return null;
  }
  if (typeof formattedValue.value === "undefined") {
    return null;
  } else {
    return String(formattedValue.value);
  }
});

const classes = computed(() => {
  const { classGenerators } = props;
  if (typeof classGenerators === "undefined") {
    return [];
  }
  return classGenerators
    .map((classItem) => {
      if (typeof classItem === "function") {
        return typeof formattedValue.value === "undefined"
          ? null
          : classItem(formattedValue.value);
      }
      if (typeof classItem === "object") {
        return classItem[formattedValue.value as string];
      }
      return classItem;
    })
    .filter((obj) => obj !== null);
});

const cellRenderer: Ref<InstanceType<typeof CellRenderer> | null> = ref(null);
const getCellContentWidth = () => cellRenderer.value?.getCellContentWidth();

defineExpose({
  getCellContentWidth,
});
</script>

<template>
  <CellRenderer
    ref="cellRenderer"
    :is-clickable="isClickable"
    :is-missing="isMissing"
    :is-slotted="props.isSlotted"
    :text="formattedValue"
    :title="title"
    :color="color"
    :padding-left="paddingLeft"
    :classes="classes"
    :select-on-move="props.selectOnMove"
    :size="props.size"
    @click="(value) => emit('click', value)"
    @select="(value) => emit('select', value)"
    @input="(value) => emit('input', value)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData"
      ><slot :name="name" v-bind="slotData"
    /></template>
  </CellRenderer>
</template>
