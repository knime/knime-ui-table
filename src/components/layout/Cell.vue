<script setup lang="ts">
import { computed, ref } from "vue";
import CircleHelpIcon from "webapps-common/ui/assets/img/icons/circle-help.svg";
import type { CellProps } from "./CellProps";

const emit = defineEmits(["click", "input"]);
const props = defineProps<CellProps>();

const PADDING_LEFT_DEFAULT_CELL = 10;
const PADDING_LEFT_COLORED_CELL = 20;
const paddingLeft = computed(() => {
  const { backgroundColor } = props;
  return backgroundColor === null
    ? PADDING_LEFT_DEFAULT_CELL
    : PADDING_LEFT_COLORED_CELL;
});

const totalWidth = computed(() => props.size ?? 100);

const cellBackgroundColorStyle = computed(() => {
  const { backgroundColor } = props;
  return backgroundColor === null
    ? {}
    : {
        "--cell-background-color": backgroundColor,
      };
});
const classes = computed(() => {
  const { classGenerators, text: value } = props;
  if (typeof classGenerators === "undefined") {
    return [];
  }
  return classGenerators
    .map((classItem) => {
      if (typeof classItem === "function") {
        return typeof value === "undefined" ? null : classItem(value);
      }
      if (typeof classItem === "object") {
        return classItem[value as string];
      }
      return classItem;
    })
    .filter((obj) => obj !== null);
});

const dataCell = ref(null);
const getCellContentWidth = () => {
  const widthDataCellFirstChild = Math.ceil(
    dataCell.value.firstElementChild.getBoundingClientRect().width,
  );
  return paddingLeft.value + widthDataCellFirstChild;
};

defineExpose({
  getCellContentWidth,
});
</script>

<template>
  <td
    ref="dataCell"
    :class="[
      classes,
      'data-cell',
      { clickable, 'colored-cell': backgroundColor },
    ]"
    :style="{
      width: `calc(${totalWidth}px)`,
      paddingLeft: `${paddingLeft}px`,
      ...cellBackgroundColorStyle,
    }"
    :title="title === null ? undefined : title"
    @click="
      (event: Event) => {
        if (clickable) {
          emit('click', { event: event, cell: $el });
        }
      }
    "
    @input="(val: any) => emit('input', { value: val, cell: $el })"
  >
    <CircleHelpIcon v-if="isMissing" class="missing-value-icon" />
    <slot v-else-if="isSlotted" :width="totalWidth - paddingLeft" />
    <span v-else>
      {{ text }}
    </span>
  </td>
</template>

<style lang="postcss" scoped>
& td {
  color: var(--data-cell-color);
  background-clip: border-box;

  &.colored-cell {
    background-size: 4px;
    background-repeat: no-repeat;
    background-position: 10px 0;
    background-image: linear-gradient(
      90deg,
      var(--cell-background-color),
      var(--cell-background-color)
    );
  }

  & .missing-value-icon {
    vertical-align: middle;
    min-height: 100%;
    width: 14px;
    stroke-width: calc(32px / 14);
    stroke: var(--theme-color-kudos);
  }

  &.clickable {
    cursor: pointer;
    color: var(--knime-dove-gray);

    &:hover {
      color: var(--knime-masala);
    }
  }
}
</style>