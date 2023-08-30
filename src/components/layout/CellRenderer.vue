<script setup lang="ts">
import throttle from "raf-throttle";
import { computed, ref, type Ref } from "vue";
import CircleHelpIcon from "webapps-common/ui/assets/img/icons/circle-help.svg";
import type { CellRendererProps } from "./CellRendererProps";

const emit = defineEmits(["click", "input", "select"]);
const props = defineProps<CellRendererProps>();

const cellBackgroundColorStyle = computed(() => {
  const { backgroundColor } = props;
  return backgroundColor === null
    ? {}
    : {
        "--data-cell-color": backgroundColor,
      };
});

const dataCell: Ref<HTMLElement | null> = ref(null);
const getCellContentWidth = () => {
  const widthDataCellFirstChild = Math.ceil(
    dataCell.value?.firstElementChild?.getBoundingClientRect().width ?? 0,
  );
  return props.paddingLeft + widthDataCellFirstChild;
};

defineExpose({
  getCellContentWidth,
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
        clickable: props.isClickable,
        'colored-cell': backgroundColor,
      },
    ]"
    :style="{
      width: `calc(${props.size}px)`,
      paddingLeft: `${props.paddingLeft}px`,
      ...cellBackgroundColorStyle,
    }"
    :title="title === null ? undefined : title"
    @click="
      (event: MouseEvent) => {
        if (props.isClickable) {
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
    <slot v-else-if="isSlotted" :width="props.size - props.paddingLeft" />
    <span v-else>
      {{ text }}
    </span>
  </td>
</template>

<style lang="postcss" scoped>
& td {
  background-clip: border-box;
  user-select: none;

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