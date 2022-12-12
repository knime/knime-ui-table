<script>
import { mixin as VueClickAway } from 'vue3-click-away';

import DropdownIcon from 'webapps-common/ui/assets/img/icons/arrow-dropdown.svg';

const KEY_DOWN = 40;
const KEY_UP = 38;
const KEY_HOME = 36;
const KEY_END = 35;
const KEY_ESC = 27;
const KEY_ENTER = 13;
const KEY_SPACE = 32;

/**
 * A dropdown component specifically styled for the column filter header of the table. This
 * component also has a modified placeholder which can display a specially formatted value.
 *
 * @emits input event when an option is selected.
 */
export default {
    components: {
        DropdownIcon
    },
    mixins: [VueClickAway],
    props: {
        id: {
            type: String,
            default: ''
        },
        value: {
            type: [String, Array],
            default: ''
        },
        placeholder: {
            type: String,
            default: null
        },
        ariaLabel: {
            type: String,
            required: true
        },
        /**
         * List of possible values. Each item must have an `id` and a `text` property
         * @example
         * [{
         *   id: 'pdf',
         *   text: 'PDF'
         * }, {
         *   id: 'XLS',
         *   text: 'Excel',
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
        }
    },
    emits: ['input'],
    data() {
        return {
            isExpanded: false
        };
    },
    computed: {
        realValue() {
            if (Array.isArray(this.value)) {
                return this.value[0];
            }
            return this.value;
        },
        selectedIndex() {
            return this.possibleValues.map(x => x.id).indexOf(this.realValue);
        },
        showPlaceholder() {
            return !this.realValue;
        },
        displayTextMap() {
            let map = {};
            for (let value of this.possibleValues) {
                map[value.id] = value.text;
            }
            return map;
        },
        displayText() {
            if (this.showPlaceholder) {
                return this.placeholder;
            } else if (this.displayTextMap.hasOwnProperty(this.realValue)) {
                return this.displayTextMap[this.realValue];
            } else {
                return `(MISSING) ${this.realValue}`;
            }
        }
    },
    methods: {
        isCurrentValue(candidate) {
            return this.realValue === candidate;
        },
        setSelected(value) {
            consola.trace('ListBox setSelected on', value);
            /**
             * Fired when the selection changes.
             *
             * @event input
             * @type {String}
             */
            this.$emit('input', value);
        },
        onOptionClick(value) {
            this.setSelected(value);
            this.isExpanded = false;
            this.$refs.button.focus();
        },
        scrollTo(optionIndex) {
            let listBoxNode = this.$refs.ul;
            if (listBoxNode.scrollHeight > listBoxNode.clientHeight) {
                let element = this.$refs.options[optionIndex];
                let scrollBottom = listBoxNode.clientHeight + listBoxNode.scrollTop;
                let elementBottom = element.offsetTop + element.offsetHeight;
                if (elementBottom > scrollBottom) {
                    listBoxNode.scrollTop = elementBottom - listBoxNode.clientHeight;
                } else if (element.offsetTop < listBoxNode.scrollTop) {
                    listBoxNode.scrollTop = element.offsetTop;
                }
            }
        },
        onArrowDown() {
            let next = this.selectedIndex + 1;
            if (next >= this.possibleValues.length) {
                return;
            }
            this.setSelected(this.possibleValues[next].id);
            this.scrollTo(next);
        },
        onArrowUp() {
            let next = this.selectedIndex - 1;
            if (next < 0) {
                return;
            }
            this.setSelected(this.possibleValues[next].id);
            this.scrollTo(next);
        },
        onEndKey() {
            let next = this.possibleValues.length - 1;
            this.setSelected(this.possibleValues[next].id);
            this.$refs.ul.scrollTop = this.$refs.ul.scrollHeight;
        },
        onHomeKey() {
            let next = 0;
            this.setSelected(this.possibleValues[next].id);
            this.$refs.ul.scrollTop = 0;
        },
        toggleExpanded() {
            this.isExpanded = !this.isExpanded;
            if (this.isExpanded) {
                this.$nextTick(() => this.$refs.ul.focus());
            }
        },
        handleKeyDownList(e) {
            /* NOTE: we use a single keyDown method because @keydown.up bindings are not testable. */
            if (e.keyCode === KEY_DOWN) {
                this.onArrowDown();
                e.preventDefault();
            }
            if (e.keyCode === KEY_UP) {
                this.onArrowUp();
                e.preventDefault();
            }
            if (e.keyCode === KEY_END) {
                this.onEndKey();
                e.preventDefault();
            }
            if (e.keyCode === KEY_HOME) {
                this.onHomeKey();
                e.preventDefault();
            }
            if (e.keyCode === KEY_ESC) {
                this.isExpanded = false;
                this.$refs.ul.blur();
                e.preventDefault();
            }
            if (e.keyCode === KEY_ENTER) {
                this.isExpanded = false;
                this.$refs.button.focus();
                e.preventDefault();
            }
        },
        handleKeyDownButton(e) {
            if (e.keyCode === KEY_ENTER || e.keyCode === KEY_SPACE) {
                this.toggleExpanded();
                e.preventDefault();
            }
            if (e.keyCode === KEY_DOWN) {
                this.onArrowDown();
                e.preventDefault();
            }
            if (e.keyCode === KEY_UP) {
                this.onArrowUp();
                e.preventDefault();
            }
        },
        getCurrentSelectedId() {
            try {
                return this.possibleValues[this.selectedIndex].id;
            } catch (e) {
                return '';
            }
        },
        generateId(node, itemId) {
            if (!itemId) {
                return `${node}-${this.id}`;
            }
            let cleanId = String(itemId).replace(/[^\w]/gi, '');
            return `${node}-${this.id}-${cleanId}`;
        },
        clickAway() {
            this.isExpanded = false;
        }
    }
};
</script>

<template>
  <div
    v-click-away="clickAway"
    :class="['dropdown' , { collapsed: !isExpanded }]"
  >
    <div
      :id="generateId('button')"
      ref="button"
      role="button"
      tabindex="0"
      aria-haspopup="listbox"
      :class="{'placeholder': showPlaceholder}"
      :aria-label="ariaLabel"
      :aria-labelledby="generateId('button')"
      :aria-expanded="isExpanded"
      @click="toggleExpanded"
      @keydown="handleKeyDownButton"
    >
      {{ displayText }}
      <DropdownIcon class="icon" />
    </div>
    <ul
      v-show="isExpanded"
      ref="ul"
      role="listbox"
      tabindex="-1"
      :aria-activedescendant="isExpanded ? generateId('option', getCurrentSelectedId()) : false"
      @keydown="handleKeyDownList"
    >
      <li
        v-for="item of possibleValues"
        :id="generateId('option', item.id)"
        :key="`listbox-${item.id}`"
        ref="options"
        role="option"
        :title="item.text"
        :class="{ 'focused': isCurrentValue(item.id), 'noselect': true, 'empty': item.text.trim() === '' }"
        :aria-selected="isCurrentValue(item.id)"
        @click="onOptionClick(item.id)"
      >
        {{ item.text }}
      </li>
    </ul>
  </div>
</template>

<style lang="postcss" scoped>
.dropdown {
  position: relative;
  background-color: var(--knime-white);

  & .placeholder {
    color: var(--knime-stone-gray);
  }

  & [role="button"] {
    margin: 0;
    border: 1px solid var(--knime-stone-gray);
    padding: 0 38px 0 10px;
    font-size: 13px;
    font-weight: 400;
    height: 27px;
    line-height: 26px; /* to center text vertically */
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:focus {
      border-color: var(--knime-masala);
      outline: none;
    }
  }

  &:not(.collapsed) [role="button"] {
    border-color: var(--knime-masala);
  }

  &.collapsed:hover {
    background: var(--knime-silver-sand-semi);
  }

  & .icon {
    width: 12px;
    height: 12px;
    stroke-width: calc(32px / 12);
    stroke: var(--knime-masala);
    position: absolute;
    right: 7px;
    top: 9px;
    pointer-events: none;
    transition: transform 0.2s ease-in-out;
  }

  &:not(.collapsed) .icon {
    transform: scaleY(-1);
  }

  /* this selector is required to override some * rules interfere (overflow) - so do not simplify */
  & [role="listbox"] {
    overflow-y: auto;
    position: absolute;
    z-index: 2;
    max-height: calc(22px * 7); /* show max 7 items */
    font-size: 13px;
    font-weight: 400;
    min-height: 22px;
    width: 100%;
    padding: 0;
    margin: -1.5px 0 1px;
    background: var(--knime-white);
    box-shadow: 0 1px 5px 0 var(--knime-gray-dark);
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--knime-masala);
    }
  }

  & [role="option"] {
    display: block;
    width: 100%;
    padding: 0 10px;
    line-height: 22px;
    position: relative;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    background: var(--theme-dropdown-background-color);
    color: var(--theme-dropdown-foreground-color);

    &.empty {
      white-space: pre-wrap;
    }

    &:hover {
      background: var(--theme-dropdown-background-color-hover);
      color: var(--theme-dropdown-foreground-color-hover);
    }

    &:focus {
      background: var(--theme-dropdown-background-color-focus);
      color: var(--theme-dropdown-foreground-color-focus);
    }

    &.focused {
      background: var(--theme-dropdown-background-color-selected);
      color: var(--theme-dropdown-foreground-color-selected);
    }
  }

  & .noselect {
    user-select: none;
  }
}
</style>
