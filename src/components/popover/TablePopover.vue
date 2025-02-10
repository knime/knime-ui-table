<script setup lang="ts">
import { type Ref, computed, ref } from "vue";
import {
  arrow,
  autoUpdate,
  flip,
  limitShift,
  offset,
  shift,
  size,
  useFloating,
} from "@floating-ui/vue";

import { FunctionButton, useClickOutside } from "@knime/components";
import CloseIcon from "@knime/styles/img/icons/close.svg";

import { type ColumnType, columnTypes } from "@/config/table.config";

import ArrayRenderer from "./ArrayRenderer.vue";
import MessageRenderer from "./MessageRenderer.vue";
import ObjectRenderer from "./ObjectRenderer.vue";
import StringRenderer from "./StringRenderer.vue";

/**
 * This component is a global popover which dynamically determines where it should
 * be displayed using floatingUI.
 *
 * It has a slot to allow the use of dynamic rendering components and also dynamically
 * changes its rendering format based on the data provided.
 *
 * @emits close event when the popover is closed.
 */

const MAX_HEIGHT_OR_WIDTH = 300;
const CONTENT_PADDING = 23;

const renderers = {
  ObjectRenderer,
  StringRenderer,
  ArrayRenderer,
  MessageRenderer,
} as const;

type RendererType = keyof typeof renderers;

export type PopoverRenderer =
  | ColumnType
  | {
      type: RendererType;
      process?: (data: any) => any;
    }
  | undefined;

const props = defineProps<{
  data: unknown;
  target: HTMLElement;
  renderer?: PopoverRenderer;
}>();

const emit = defineEmits(["close"]);
const close = () => emit("close");

const componentType = computed<RendererType>(() => {
  if (typeof props.renderer === "object") {
    return props.renderer.type;
  }
  switch (props.renderer) {
    case columnTypes.Nominal:
    case columnTypes.String:
      return "StringRenderer";
    case columnTypes.Array:
      return "ArrayRenderer";
    case columnTypes.DateTime:
    case columnTypes.Number:
    case columnTypes.Boolean:
    default:
      return "ObjectRenderer";
  }
});

// For additional styling of the box around certain renderers
const typeClass = computed(() =>
  typeof props.renderer === "string"
    ? props.renderer.toLowerCase()
    : props.renderer?.type.toLowerCase(),
);

const processedData = computed(
  () =>
    (typeof props.renderer === "object" &&
      props.renderer?.process?.(props.data)) ||
    props.data,
);

const floating: Ref<null | HTMLElement> = ref(null);
useClickOutside({ callback: close, targets: [floating] });
const floatingArrow: Ref<null | HTMLElement> = ref(null);

const maxHeight = ref(MAX_HEIGHT_OR_WIDTH);
const maxWidth = ref(MAX_HEIGHT_OR_WIDTH);
const contentStyles = computed(() => ({
  maxHeight: `${maxHeight.value - 2 * CONTENT_PADDING}px`,
  maxWidth: `${maxWidth.value - 2 * CONTENT_PADDING}px`,
}));

const { x, y, middlewareData, placement } = useFloating(
  computed(() => props.target),
  floating,
  {
    placement: "bottom",
    whileElementsMounted: autoUpdate,
    middleware: [
      /**
       * Clip the floating popover to its referenceEl to stay visible horizontally
       * as long as possible
       */
      shift({
        limiter: limitShift({
          crossAxis: false,
          offset: ({ rects }) => rects.reference.width,
        }),
      }),
      /**
       * Enable positioning an arrow pointing to the referenceEl
       */
      arrow({ element: floatingArrow }),
      /**
       * Slightly move the popover away from the referenceEl
       * to make space for the arrow while still overlapping the cell with it
       */
      offset({
        mainAxis: 5,
      }),
      /**
       * Flip to the top if the default placement is not possible with the full height
       */
      flip(),
      /**
       * Limits the height of the popover to stay visible vertically as long as possible
       */
      size({
        padding: 10,
        apply({ availableWidth, availableHeight }) {
          maxWidth.value = Math.min(MAX_HEIGHT_OR_WIDTH, availableWidth);
          maxHeight.value = Math.min(MAX_HEIGHT_OR_WIDTH, availableHeight);
        },
      }),
    ],
  },
);

const isTop = computed(() => placement.value.startsWith("top"));
const show = computed(
  () =>
    typeof processedData.value !== "undefined" && processedData.value !== null,
);
</script>

<template>
  <div
    v-show="show"
    ref="floating"
    :style="{ left: `${x}px`, top: `${y}px` }"
    :class="['content', typeClass]"
  >
    <div
      ref="floatingArrow"
      class="arrow"
      :style="{
        left: `${middlewareData.arrow?.x ?? 0}px`,
        [isTop ? 'bottom' : 'top']: '-16px',
        ...(isTop ? { rotate: '180deg' } : {}),
      }"
    />
    <div :style="{ padding: `${CONTENT_PADDING}px` }">
      <slot name="content" :style="contentStyles">
        <component
          :is="renderers[componentType]"
          :data="processedData"
          :style="contentStyles"
        />
      </slot>
    </div>
    <FunctionButton class="closer" @click="close">
      <CloseIcon />
    </FunctionButton>
  </div>
</template>

<style lang="postcss" scoped>
& .content {
  position: absolute;
  z-index: var(--z-index-table-popover-content);
  background: var(--knime-white);
  width: fit-content;
  height: fit-content;
  font-size: 12px;
  box-shadow: 0 0 8px rgb(0 0 0 / 25%);

  & .arrow {
    --popover-arrow-size: 15px;

    position: absolute;
    width: var(--popover-arrow-size);
    height: var(--popover-arrow-size);
    border-left: calc(var(--popover-arrow-size) + 1px) solid transparent;
    border-right: calc(var(--popover-arrow-size) + 1px) solid transparent;
    border-bottom: calc(var(--popover-arrow-size) + 1px) solid
      var(--knime-silver-sand-semi);
  }

  &.array,
  &.object {
    width: 320px;
  }
}

& .closer {
  position: absolute;
  height: 20px;
  width: 20px;
  top: 2px;
  right: 2px;
  padding: 3px;
  margin: 5px;

  & svg {
    height: 14px;
    width: 14px;
    stroke-width: calc(32px / 14);
  }
}
</style>
