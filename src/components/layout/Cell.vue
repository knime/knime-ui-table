<script setup lang="ts">
import { type Ref, computed, ref } from "vue";

import {
  getCellPaddingLeft,
  getColor,
  isMissingValue,
  unpackObjectRepresentation,
} from "@/util";

import type { CellProps } from "./CellProps";
import CellRenderer from "./CellRenderer.vue";

const emit = defineEmits(["click", "input", "select", "dataValueView"]);
const props = defineProps<CellProps>();

const paddingLeft = computed(() => getCellPaddingLeft(props.cellData));

const color = computed(() => getColor(props.cellData));

const isClickable = computed(() => {
  const { cellData, isClickableByConfig } = props;
  return isClickableByConfig && Boolean(cellData) && cellData !== "-";
});

const isMissing = computed(() => isMissingValue(props.cellData));

const unpackedValue = computed(() =>
  unpackObjectRepresentation(props.cellData),
);

const formattedValue = computed(() =>
  props.formatter(unpackObjectRepresentation(unpackedValue.value)),
);

const title = computed(() => {
  const { cellData } = props;
  if (isMissingValue(cellData)) {
    const metadata = cellData?.metadata;
    const missingValueMsg =
      typeof metadata === "string" ? ` (${metadata})` : "";
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
        return typeof unpackedValue.value === "undefined"
          ? null
          : classItem(unpackedValue.value);
      }
      if (typeof classItem === "object") {
        return classItem[unpackedValue.value as string];
      }
      return classItem;
    })
    .filter((obj) => obj !== null);
});

const cellRenderer: Ref<InstanceType<typeof CellRenderer> | null> = ref(null);
const getCellContentDimensions = () =>
  cellRenderer.value?.getCellContentDimensions();

defineExpose({
  getCellContentDimensions,
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
    :default-top-bottom-padding="props.defaultTopBottomPadding"
    :size="props.size"
    :enable-expand="!isMissing && props.hasDataValueView"
    :is-selected="props.isSelected"
    :is-to-be-expanded="props.isToBeExpanded"
    @click="(value) => emit('click', value)"
    @expand="() => emit('dataValueView')"
    @select="(value) => emit('select', value)"
    @input="(value) => emit('input', value)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData"
      ><slot :name="name" v-bind="slotData"
    /></template>
  </CellRenderer>
</template>
