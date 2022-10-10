<script>
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox.vue';
import DropdownIcon from '~/webapps-common/ui/assets/img/icons/arrow-dropdown.svg?inline';
import MenuOptionsIcon from '~/webapps-common/ui/assets/img/icons/menu-options.svg?inline';
import { mixin as clickaway } from 'vue-clickaway2';

const BLUR_TIMEOUT = 1;

/**
 * A multi component specifically styled for use in the table controls. This component allows
 * grab-and-drop reordering of its list items.
 *
 * @emits input event when an option is selected.
 * @emits columnReorder event when the order of the list items changes.
 */
export default {
    components: {
        Checkbox,
        DropdownIcon,
        MenuOptionsIcon
    },
    mixins: [clickaway],
    props: {
        /**
         * List of possible values. Each item must have an `id` and a `text` property, and optionally a `selectedText`
         * property that is used for displaying the list of selected items. If it is omitted, `text` is used instead.
         * @example
         * [{
         *   id: 'pdf',
         *   text: 'PDF'
         * }, {
         *   id: 'XLS',
         *   text: 'Excel',
         *   selectedText: '.xls'
         * }]
         */
        possibleValues: {
            type: Array,
            default: () => [],
            validator(values) {
                if (!Array.isArray(values)) {
                    return false;
                }
                return values.every(item => item.hasOwnProperty('id') && item.hasOwnProperty('text'));
            }
        },
        /**
         * Selected value (which is a list of ids of entries).
         */
        value: {
            type: Array,
            default: () => []
        },
        /**
         * Placeholder to be displayed when nothing is selected.
         */
        placeholder: {
            type: String,
            default: null
        },
        /**
         * If the placeholder should always be displayed; else selected values will be listed.
         */
        lockPlaceholder: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            checkedValue: this.value,
            collapsed: true,
            dragGhost: null,
            dragInd: null,
            hoverInd: null,
            hoverIndItem: null,
            listItemHeightCutoff: 15
        };
    },
    computed: {
        /**
         * @returns {Array<Element>} - HTML Elements to use for focus and events.
         */
        focusOptions() {
            return this.$refs.option.map(ref => ref.$el.querySelector('input'));
        },
        optionText() {
            if (this.checkedValue.length === 0 || this.lockPlaceholder) {
                return this.placeholder;
            }
            return this.possibleValues
                .filter(({ id }) => this.checkedValue.indexOf(id) > -1)
                .map(({ text, selectedText = text }) => selectedText)
                .join(', ');
        }
    },
    watch: {
        value(newValue) {
            this.checkedValue = newValue;
        }
    },
    methods: {
        /**
         * Returns the next HTML Element from the list of items. If the current focused Element is at the top or bottom
         * of the list, this method will return the opposite end.
         *
         * @param {Number} changeInd - the positive or negative index shift for the next Element (usually 1 || -1).
         * @returns {Element} - the next option Element in the list of options.
         */
        getNextElement(changeInd) {
            return this.focusOptions[this.focusOptions.indexOf(document.activeElement) + changeInd] || (changeInd < 0
                ? this.focusOptions[this.focusOptions.length - 1]
                : this.focusOptions[0]);
        },
        onInput(value, toggled) {
            if (toggled) {
                if (this.checkedValue.indexOf(value) === -1) {
                    this.checkedValue.push(value);
                }
            } else {
                this.checkedValue = this.checkedValue.filter(x => x !== value);
            }
            consola.trace('Multiselect value changed to', this.checkedValue);
            /**
             * Fired when the selection changes.
             *
             * @event input
             * @type {Array}
             */
            this.$emit('input', this.checkedValue);
        },
        toggle() {
            this.collapsed = !this.collapsed;
            setTimeout(() => {
                this.$refs.toggle.focus();
            }, BLUR_TIMEOUT);
        },
        isChecked(itemId) {
            return this.checkedValue.indexOf(itemId) > -1;
        },
        /**
         * Handle closing the options.
         *
         * @param {Boolean} [refocusToggle] - if the toggle button should be re-focused after closing.
         * @return {undefined}
         */
        closeOptions(refocusToggle) {
            this.collapsed = true;
            // explicitly check for true because vue-clickaway passes an event
            if (refocusToggle === true) {
                setTimeout(() => {
                    this.$refs.toggle.focus();
                }, BLUR_TIMEOUT);
            }
        },
        /* Handle arrow key "up" events. */
        onUp() {
            if (document.activeElement === this.$refs.toggle) {
                return;
            }
            this.getNextElement(-1).focus();
        },
        /* Handle arrow key "down" events. */
        onDown() {
            this.getNextElement(1).focus();
        },
        onDragStart(event, ind) {
            consola.trace('Drag triggered: ', event, ind);
            this.dragInd = ind;
            this.dragGhost = this.$refs.item[ind].querySelector('label').cloneNode(true);
            document.body.appendChild(this.dragGhost);
        },
        onDragEnd(event) {
            let offset = this.hoverInd < this.possibleValues?.length - 1 ? 1 : 0;
            if (this.dragGhost) {
                document.body.removeChild(this.dragGhost);
                this.$emit('columnReorder', this.dragInd, this.hoverInd + offset);
            }
            this.$refs.item[this.hoverInd + offset].focus();
            this.dragGhost = null;
            this.dragInd = null;
            this.hoverInd = null;
        },
        onDragOver(event, ind) {
            this.hoverIndItem = ind;
            // detect when moving between options
            if (event.offsetY < this.listItemHeightCutoff) {
                ind -= 1;
            }
            if (this.dragGhost) {
                this.hoverInd = ind;
            }
        },
        onDragLeave() {
            this.hoverInd = null;
        }
    }
};
</script>

<template>
  <div
    v-on-clickaway="closeOptions"
    :class="['multiselect', { collapsed }]"
    @keydown.esc.stop.prevent="closeOptions(true)"
    @keydown.up.stop.prevent="onUp"
    @keydown.down.stop.prevent="onDown"
    @dragleave="onDragLeave"
  >
    <div
      ref="toggle"
      role="button"
      tabindex="0"
      :class="{ placeholder: !checkedValue.length || lockPlaceholder }"
      @click="toggle"
      @keydown.space.prevent="toggle"
    >
      {{ optionText }}
    </div>
    <DropdownIcon class="icon" />
    <div
      v-show="!collapsed"
      class="options"
      @dragleave.stop.prevent=""
    >
      <div
        v-if="dragInd !== 0 && hoverInd === -1"
        class="drag-spacer drag-first"
      />
      <span
        v-for="(item, ind) of possibleValues"
        ref="item"
        :key="`multiselect-${item.id}`"
        :class="{'hovered': dragInd !== ind && hoverIndItem === ind, 'drag-item': dragInd === ind}"
        @dragover.stop.prevent="onDragOver($event, ind)"
        @keydown.esc.stop.prevent="closeOptions(true)"
      >
        <div
          draggable
          :class="['item-' + ind, 'drag-handle']"
          @dragstart="onDragStart($event, ind)"
          @dragend="onDragEnd($event, ind)"
        >
          <MenuOptionsIcon class="drag left-drag" />
          <MenuOptionsIcon class="drag right-drag" />
        </div>
        <Checkbox
          ref="option"
          :value="isChecked(item.id)"
          :class="['boxes']"
          @input="onInput(item.id, $event)"
          @keydown.esc.stop.prevent="closeOptions(true)"
        >
          {{ item.text }}
        </Checkbox>
        <div
          v-if="dragInd !== ind && dragInd - 1!== ind && hoverInd === ind"
          class="drag-spacer"
          @dragover.stop.prevent=""
          @dragenter.stop.prevent=""
        />
      </span>
    </div>
  </div>
</template>

<style scoped lang="postcss">

.multiselect {
  position: relative;

  & [role=button] {
    margin: 0;
    padding: 0 38px 0 10px;
    font-size: 13px;
    font-weight: 500;
    height: 40px;
    line-height: 40px; /* to center text vertically */
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.placeholder {
      color: var(--knime-stone-gray);
    }

    &:focus,
    &:hover {
      outline: none;
      color: var(--knime-masala);

      & >>> svg {
        stroke: var(--knime-masala);
      }
    }
  }

  & .icon {
    width: 18px;
    height: 18px;
    stroke-width: calc(32px / 18);
    stroke: var(--knime-dove-gray);
    position: absolute;
    right: 10px;
    top: 11px;
    pointer-events: none;
    transition: transform 0.2s ease-in-out;
  }

  &:not(.collapsed) .icon {
    transform: scaleY(-1);
  }

  & .options {
    position: absolute;
    z-index: 2;
    min-width: 100%;
    width: fit-content;
    margin-top: -1px;
    background: var(--knime-white);
    box-shadow: 0 1px 4px 0 var(--knime-gray-dark-semi);


    & span {
      position: relative;
      padding: 5px 10px 0 10px;
      display: block;

      &.drag-item {
        background-color: var(--knime-silver-sand);
        opacity: 0.5;
      }

      &.hovered {
        background-color: var(--knime-silver-sand-semi);
      }

      & .drag-handle {
        cursor: move;

        & .drag {
          position: absolute;
          height: 22px;
          top: 5px;

          &.left-drag {
            left: -1px;
          }

          &.right-drag {
            left: 5px;
          }
        }
      }

      & .boxes {
        display: block;
        position: relative;
        margin-left: 16px;
        font-size: 13px;
        font-weight: 500;
        color: var(--knime-masala);
      }
    }

    & .drag-spacer {
      height: 1px;
      margin: auto;
      right: 0;
      left: 0;
      width: 75%;
      position: absolute;
      bottom: 0;
      background-color: var(--knime-dove-gray);

      &.drag-first {
        top: 0;
        z-index: 2;
        margin-top: unset;
        margin-bottom: unset;
      }
    }
  }
}

</style>
