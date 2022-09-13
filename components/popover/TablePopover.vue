<script>
import { columnTypes } from '../../config/table.config';
import { mixin as clickaway } from 'vue-clickaway2';
import StringRenderer from './StringRenderer.vue';
import ObjectRenderer from './ObjectRenderer.vue';
import ArrayRenderer from './ArrayRenderer.vue';
import MessageRenderer from './MessageRenderer.vue';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton.vue';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';

const PARENT_RATIO = .5;
const MAX_TOTAL_HEIGHT = 300;

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
        CloseIcon
    },
    mixins: [clickaway],
    props: {
        initiallyExpanded: {
            type: Boolean,
            default: false
        },
        data: {
            type: null,
            default: null,
            required: true
        },
        target: {
            type: null,
            default: null,
            required: true
        },
        renderer: {
            type: [Object, String],
            default: columnTypes.Object
        },
        rowHeight: {
            type: Number,
            default: 40
        }
    },
    data() {
        return {
            expanded: this.initiallyExpanded,
            type: this.renderer?.type || this.renderer,
            offsetParentHeight: this.target.offsetParent.clientHeight,
            offsetTop: this.target.offsetTop,
            offsetLeft: this.target.offsetLeft,
            offsetHeight: this.target.offsetHeight,
            offsetWidth: this.target.offsetWidth,
            rowOffset: (this.rowHeight / 2) - 2
        };
    },
    computed: {
        componentType() {
            if (this.renderer?.type) {
                return this.renderer.type;
            }
            switch (this.renderer) {
                case columnTypes.Nominal:
                case columnTypes.String:
                    return 'StringRenderer';
                case columnTypes.Array:
                    return 'ArrayRenderer';
                case columnTypes.DateTime:
                case columnTypes.Number:
                case columnTypes.Boolean:
                default:
                    return 'ObjectRenderer';
            }
        },
        processedData() {
            return this.renderer?.process?.(this.data) || this.data;
        },
        displayTop() {
            return this.offsetTop / this.offsetParentHeight >= PARENT_RATIO;
        },
        verticalUnits() {
            return this.displayTop ? 'bottom' : 'top';
        },
        top() {
            return this.offsetTop + (this.offsetHeight / 2);
        },
        left() {
            return this.offsetLeft + (this.offsetWidth / 2);
        },
        maxHeight() {
            return Math.max(this.displayTop ? this.top : this.offsetParentHeight - this.top, MAX_TOTAL_HEIGHT);
        },
        style() {
            return {
                top: `${this.top}px`,
                left: `${this.left}px`
            };
        },
        contentStyle() {
            return {
                [this.verticalUnits]: `${this.target.clientHeight - this.rowOffset}px`,
                'max-height': `${this.maxHeight}px`
            };
        },
        childMaxHeight() {
            return {
                'max-height': `${this.maxHeight - this.rowHeight}px`
            };
        },
        show() {
            return typeof this.processedData !== 'undefined' && this.processedData !== null;
        }
    },
    methods: {
        closeMenu() {
            consola.trace('Closing popover menu');
            this.$emit('close');
            this.expanded = false;
        },
        openMenu() {
            consola.trace('Opening popover menu');
            this.expanded = true;
        }
    }
};
</script>

<template>
  <div
    ref="wrapper"
    v-on-clickaway="closeMenu"
    :class="['popover', { expanded }, { top: displayTop }]"
    :style="style"
    :expanded="expanded"
  >
    <div
      v-show="expanded && show"
      :style="contentStyle"
      :class="['content', type.toLowerCase()]"
    >
      <div class="content-container">
        <slot
          name="content"
          :style="childMaxHeight"
        >
          <Component
            :is="componentType"
            :data="processedData"
            :style="childMaxHeight"
          />
        </slot>
      </div>
      <FunctionButton
        class="closer"
        @click="closeMenu"
      >
        <CloseIcon />
      </FunctionButton>
    </div>
  </div>
</template>


<style lang="postcss" scoped>

.popover {
  position: absolute;
  --popoverTopMargin: 18px;
  --popoverArrowSize: 15px;

  &.expanded {
    &::before {
      position: absolute;
      top: calc(100% + 7px);
      right: 20px;
      content: '';
      z-index: 5;
      width: 0;
      height: 0;
      border-left: var(--popoverArrowSize) solid transparent;
      border-right: var(--popoverArrowSize) solid transparent;
      border-bottom: var(--popoverArrowSize) solid var(--knime-white);
    }

    &::after {
      position: absolute;
      top: calc(100% + 6px);
      right: 19px;
      content: '';
      z-index: 4;
      width: 0;
      height: 0;
      border-left: calc(var(--popoverArrowSize) + 1px) solid transparent;
      border-right: calc(var(--popoverArrowSize) + 1px) solid transparent;
      border-bottom: calc(var(--popoverArrowSize) + 1px) solid var(--knime-silver-sand-semi);
    }

    &.top::before {
      bottom: calc(100% + 7px);
      top: unset;
      border-bottom: none;
      border-top: var(--popoverArrowSize) solid var(--knime-white);
    }

    &.top::after {
      bottom: calc(100% + 6px);
      top: unset;
      border-bottom: none;
      border-top: calc(var(--popoverArrowSize) + 1px) solid var(--knime-silver-sand-semi);
    }
  }

  & .content {
    max-width: 300px;
    position: absolute;
    z-index: 4;
    right: 0;
    background: var(--knime-white);
    width: fit-content;
    font-size: 12px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);

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
