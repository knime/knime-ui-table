<script setup lang="ts">
import { type Ref, computed, onMounted, ref, watch } from "vue";
import throttle from "raf-throttle";

import CircleHelpIcon from "@knime/styles/img/icons/circle-help.svg";

import { useDataValueViews } from "../composables/useDataValueViews";

import type { CellRendererProps } from "./CellRendererProps";
import ExpandIcon from "./expand.svg";

const emit = defineEmits(["click", "expand", "input", "select"]);
const props = defineProps<CellRendererProps>();

const dataCellColorStyle = computed(() => {
  const { color } = props;
  return color === null
    ? {}
    : {
        "--data-cell-color": color,
      };
});

const hasPaddingTopBottom = computed(() => {
  if (props.isEditing) {
    return false;
  }
  if (props.isMissing) {
    return true;
  }
  return !(props.isSlotted && Boolean(props.noPadding));
});

const hasPaddingLeft = computed(() => {
  if (props.isEditing) {
    return false;
  }
  if (props.isMissing) {
    return true;
  }
  return !(props.isSlotted && Boolean(props.noPaddingLeft));
});

const paddingTopBottom = computed(() => {
  if (!hasPaddingTopBottom.value) {
    return {};
  }

  let paddingTopBottom = props.defaultTopBottomPadding;
  if (props.isMissing) {
    // height of text is 16px, height of missing value icon is 14px => padding needs to be increased by 1px
    paddingTopBottom += 1;
  }

  return {
    paddingTop: `${paddingTopBottom}px`,
    paddingBottom: `${paddingTopBottom}px`,
  };
});

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

const onPointerMove = throttle(() => {
  if (props.selectOnMove) {
    emit("select", { expandSelection: true });
  }
});

const onPointerDown = (event: MouseEvent) => {
  if (event.button === 0) {
    emit("select", { expandSelection: event.shiftKey });
  }
};

const expand = () => emit("expand");
const expandAndSelect = (event: MouseEvent) => {
  expand();

  emit("select", { expandSelection: event.shiftKey, ignoreIfSelected: true });
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
};

const { close: closeExpandedSelectedCell } = useDataValueViews();

const changeExpandedCellViewIfNecessary = () => {
  if (props.isToBeExpanded) {
    if (props.enableExpand) {
      expand();
    } else {
      closeExpandedSelectedCell();
    }
  }
};

watch(() => props.isToBeExpanded, changeExpandedCellViewIfNecessary);
onMounted(changeExpandedCellViewIfNecessary);
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
      ...(hasPaddingLeft ? { paddingLeft: `${paddingLeft}px` } : {}),
      ...paddingTopBottom,
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
    @dblclick="(event: MouseEvent) => enableExpand && expandAndSelect(event)"
    @pointermove="onPointerMove"
    @pointerdown="onPointerDown"
    @input="(val: any) => emit('input', { value: val, cell: $el })"
  >
    <slot v-if="isEditing" name="editable-cell" :cell-element="$el" />
    <CircleHelpIcon v-else-if="isMissing" class="missing-value-icon" />
    <slot v-else-if="isSlotted" :width="size - paddingLeft" />
    <span v-else>
      {{ text }}
    </span>
    <ExpandIcon
      v-if="enableExpand"
      :class="['expand-icon', { 'cell-selected': isSelected }]"
      @click="expandAndSelect"
    />
  </td>
</template>

<style lang="postcss" scoped>
.data-cell {
  background-clip: border-box;
  user-select: none;
  white-space: nowrap;
  position: relative;

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

  & span {
    display: inline-block;
  }

  & .expand-icon {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 9px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease;

    &.cell-selected {
      opacity: 1;
    }
  }

  &:hover .expand-icon {
    opacity: 1;
  }
}
</style>
