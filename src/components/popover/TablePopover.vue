<script lang="ts">
import { columnTypes, type ColumnType } from "@/config/table.config";
import StringRenderer from "./StringRenderer.vue";
import ObjectRenderer from "./ObjectRenderer.vue";
import ArrayRenderer from "./ArrayRenderer.vue";
import MessageRenderer from "./MessageRenderer.vue";
import { FunctionButton, useClickOutside } from "@knime/components";
import CloseIcon from "@knime/styles/img/icons/close.svg";
import { ref, type PropType } from "vue";

const PARENT_RATIO = 0.5;
const MAX_TOTAL_HEIGHT = 300;

export type PopoverRenderer =
  | ColumnType
  | {
      type: string;
      process?: (data: any) => any;
    };

/**
 * This component is a global popover which dynamically determines where it should
 * be displayed based on the DOM information of the trigger event. It uses the relative
 * position of the target and parent elements for starting coordinates and then determines
 * the correct direction to display its content based on the available space.
 *
 * It has a slot to allow the use of dynamic rendering components and also dynamically
 * changes its rendering format based on the data provided.
 *
 * @emits close event when the popover is closed.
 */
export default {
  components: {
    StringRenderer,
    ObjectRenderer,
    ArrayRenderer,
    MessageRenderer,
    FunctionButton,
    CloseIcon,
  },
  props: {
    data: {
      type: null,
      default: null,
      required: true,
    },
    target: {
      type: null,
      default: null,
      required: true,
    },
    renderer: {
      type: [Object, String] as PropType<PopoverRenderer>,
      default: columnTypes.Object,
    },
    rowHeight: {
      type: Number,
      default: 40,
    },
  },
  emits: ["close"],
  setup(_props, { emit }) {
    const close = () => emit("close");
    const wrapper = ref<null | HTMLElement>(null);
    useClickOutside({ callback: close, targets: [wrapper] });
    return { close, wrapper };
  },
  data() {
    // TODO: Followup ticket for making this work while using the virtual scroller. Currently offsetTop is always 0.
    return {
      type:
        typeof this.renderer === "string" ? this.renderer : this.renderer.type,
      offsetParentHeight: this.target.offsetParent.clientHeight,
      offsetTop: this.target.offsetTop,
      offsetParentOffsetTop: this.target.offsetParent.offsetTop,
      offsetParentOffsetLeft: this.target.offsetParent.offsetLeft,
      offsetLeft: this.target.offsetLeft,
      offsetHeight: this.target.offsetHeight,
      offsetWidth: this.target.offsetWidth,
      rowOffset: this.rowHeight / 2 - 2,
    };
  },
  computed: {
    componentType() {
      if (typeof this.renderer === "object") {
        return this.renderer.type;
      }
      switch (this.renderer) {
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
    },
    processedData() {
      return (
        (typeof this.renderer === "object" &&
          this.renderer?.process?.(this.data)) ||
        this.data
      );
    },
    displayTop() {
      return this.offsetTop / this.offsetParentHeight >= PARENT_RATIO;
    },
    verticalUnits() {
      return this.displayTop ? "bottom" : "top";
    },
    top() {
      return (
        this.offsetTop + this.offsetHeight / 2 + this.offsetParentOffsetTop
      );
    },
    left() {
      return (
        this.offsetLeft + this.offsetWidth / 2 + this.offsetParentOffsetLeft
      );
    },
    maxHeight() {
      return Math.max(
        this.displayTop ? this.top : this.offsetParentHeight - this.top,
        MAX_TOTAL_HEIGHT,
      );
    },
    style() {
      return {
        top: `${this.top}px`,
        left: `${this.left}px`,
      };
    },
    contentStyle() {
      return {
        [this.verticalUnits]: `${this.target.clientHeight - this.rowOffset}px`,
        "max-height": `${this.maxHeight}px`,
      };
    },
    childMaxHeight() {
      return {
        "max-height": `${this.maxHeight - this.rowHeight}px`,
      };
    },
    show() {
      return (
        typeof this.processedData !== "undefined" && this.processedData !== null
      );
    },
  },
};
</script>

<template>
  <div ref="wrapper" :class="['popover', { top: displayTop }]" :style="style">
    <div
      v-show="show"
      :style="contentStyle"
      :class="['content', type.toLowerCase()]"
    >
      <div class="content-container">
        <slot name="content" :style="childMaxHeight">
          <component
            :is="componentType"
            :data="processedData"
            :style="childMaxHeight"
          />
        </slot>
      </div>
      <FunctionButton class="closer" @click="close">
        <CloseIcon />
      </FunctionButton>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.popover {
  position: absolute;
  --popover-arrow-size: 15px;

  &::before {
    position: absolute;
    top: calc(100% + 7px);
    right: 20px;
    content: "";
    z-index: var(--z-index-table-popover-before);
    width: 0;
    height: 0;
    border-left: var(--popover-arrow-size) solid transparent;
    border-right: var(--popover-arrow-size) solid transparent;
    border-bottom: var(--popover-arrow-size) solid var(--knime-white);
  }

  &::after {
    position: absolute;
    top: calc(100% + 6px);
    right: 19px;
    content: "";
    z-index: var(--z-index-table-popover-after);
    width: 0;
    height: 0;
    border-left: calc(var(--popover-arrow-size) + 1px) solid transparent;
    border-right: calc(var(--popover-arrow-size) + 1px) solid transparent;
    border-bottom: calc(var(--popover-arrow-size) + 1px) solid
      var(--knime-silver-sand-semi);
  }

  &.top::before {
    bottom: calc(100% + 7px);
    top: unset;
    border-bottom: none;
    border-top: var(--popover-arrow-size) solid var(--knime-white);
  }

  &.top::after {
    bottom: calc(100% + 6px);
    top: unset;
    border-bottom: none;
    border-top: calc(var(--popover-arrow-size) + 1px) solid
      var(--knime-silver-sand-semi);
  }

  & .content {
    max-width: 300px;
    position: absolute;
    z-index: var(--z-index-table-popover-content);
    right: 0;
    background: var(--knime-white);
    width: fit-content;
    font-size: 12px;
    box-shadow: 0 0 8px rgb(0 0 0 / 25%);

    & div.content-container {
      padding: 23px;
      max-height: inherit;
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
}
</style>
