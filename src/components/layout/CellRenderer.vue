<script setup lang="ts">
import throttle from "raf-throttle";
import { computed, ref, type Ref } from "vue";
import CircleHelpIcon from "@knime/styles/img/icons/circle-help.svg";
import type { CellRendererProps } from "./CellRendererProps";

const emit = defineEmits(["click", "input", "select"]);
const props = defineProps<CellRendererProps>();

const dataCellColorStyle = computed(() => {
  const { color } = props;
  return color === null
    ? {}
    : {
        "--data-cell-color": color,
      };
});

const hasPaddingTopBottom = computed(
  () => !(props.isSlotted && Boolean(props.noPadding)) || props.isMissing,
);

const dataCell: Ref<HTMLElement | null> = ref(null);
const getCellContentDimensions = () => {
  const bcr = dataCell.value?.firstElementChild?.getBoundingClientRect();
  let widthDataCellFirstChild = 0;
  let heightDataCellFirstChild = 0;
  if (bcr) {
    widthDataCellFirstChild = Math.ceil(bcr.width);
    heightDataCellFirstChild = Math.ceil(bcr.height);
  }
  return {
    width: props.paddingLeft + widthDataCellFirstChild,
    height:
      heightDataCellFirstChild +
      (hasPaddingTopBottom.value ? props.defaultTopBottomPadding * 2 : 0),
  };
};

defineExpose({
  getCellContentDimensions,
});

const onPointerOver = throttle(() => {
  if (props.selectOnMove) {
    emit("select", { expandSelection: true });
  }
});
</script>

<template>
  <td
    ref="dataCell"
    :class="[
      classes,
      'data-cell',
      {
        clickable: isClickable,
        'colored-cell': color,
      },
    ]"
    :style="{
      width: `calc(${size}px)`,
      paddingLeft: `${paddingLeft}px`,
      ...(hasPaddingTopBottom && {
        paddingTop: `${defaultTopBottomPadding}px`,
        paddingBottom: `${defaultTopBottomPadding}px`,
      }),
      ...dataCellColorStyle,
    }"
    :title="title === null || (isSlotted && !isMissing) ? undefined : title"
    @click="
      (event: MouseEvent) => {
        if (isClickable) {
          emit('click', { event, cell: $el });
        }
      }
    "
    @pointerover="onPointerOver"
    @pointerdown="
      (event: MouseEvent) =>
        event.button === 0 &&
        emit('select', { expandSelection: event.shiftKey })
    "
    @input="(val: any) => emit('input', { value: val, cell: $el })"
  >
    <CircleHelpIcon v-if="isMissing" class="missing-value-icon" />
    <slot v-else-if="isSlotted" :width="size - paddingLeft" />
    <span v-else>
      {{ text }}
    </span>
  </td>
</template>

<style lang="postcss" scoped>
.data-cell {
  background-clip: border-box;
  user-select: none;
  white-space: nowrap;
  line-height: initial;

  &.colored-cell {
    background-size: 4px;
    background-repeat: no-repeat;
    background-position: 10px 0;
    background-image: linear-gradient(
      90deg,
      var(--data-cell-color),
      var(--data-cell-color)
    );
  }

  & .missing-value-icon {
    width: 14px;
    stroke-width: calc(32px / 14);
    stroke: var(--theme-color-error);
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
