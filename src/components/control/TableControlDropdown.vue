<script>
import DropdownIcon from '~/webapps-common/ui/assets/img/icons/arrow-dropdown.svg?inline';
import Vue from 'vue';
import { mixin as clickaway } from 'vue-clickaway';

const KEY_DOWN = 40;
const KEY_UP = 38;
const KEY_HOME = 36;
const KEY_END = 35;
const KEY_ESC = 27;
const KEY_ENTER = 13;
const KEY_SPACE = 32;

/**
 * A dropdown component specifically styled for the top and bottom control bars of the table
 * component with additional control over the relative direction of opening for the options
 * list.
 *
 * @emits input event when an option is selected.
 */
export default {
    components: {
        DropdownIcon
    },
    mixins: [clickaway],
    props: {
        value: {
            type: String,
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
        },
        formatter: {
            type: Function,
            default: item => item
        },
        includePlaceholder: {
            type: Boolean,
            default: false
        },
        openUp: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isExpanded: false,
            localValues: (() => {
                let values = this.possibleValues;
                if (this.includePlaceholder) {
                    values.unshift({
                        id: this.placeholder,
                        text: this.placeholder
                    });
                }
                return values;
            })(),
            id: 'dropdown-input'
        };
    },
    computed: {
        selectedIndex() {
            return this.localValues.map(x => x.id).indexOf(this.value);
        },
        showPlaceholder() {
            return !this.value || this.value === this.placeholder;
        },
        displayTextMap() {
            let map = {};
            for (let value of this.localValues) {
                map[value.id] = value.text;
            }
            return map;
        },
        displayText() {
            if (this.showPlaceholder) {
                return this.placeholder;
            } else if (this.displayTextMap.hasOwnProperty(this.value)) {
                return this.formatter(this.displayTextMap[this.value]);
            } else {
                return `(MISSING) ${this.value}`;
            }
        }
    },
    methods: {
        isCurrentValue(candidate) {
            return this.value === candidate;
        },
        setSelected(value) {
            consola.trace('ListBox setSelected on', value);
            if (this.includePlaceholder && value === this.placeholder) {
                value = '';
            }
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
            if (next >= this.localValues.length) {
                return;
            }
            this.setSelected(this.localValues[next].id);
            this.scrollTo(next);
        },
        onArrowUp() {
            let next = this.selectedIndex - 1;
            if (next < 0) {
                return;
            }
            this.setSelected(this.localValues[next].id);
            this.scrollTo(next);
        },
        onEndKey() {
            let next = this.localValues.length - 1;
            this.setSelected(this.localValues[next].id);
            this.$refs.ul.scrollTop = this.$refs.ul.scrollHeight;
        },
        onHomeKey() {
            let next = 0;
            this.setSelected(this.localValues[next].id);
            this.$refs.ul.scrollTop = 0;
        },
        toggleExpanded() {
            this.isExpanded = !this.isExpanded;
            if (this.isExpanded) {
                Vue.nextTick(() => this.$refs.ul.focus());
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
        hasSelection() {
            return this.selectedIndex >= 0;
        },
        getCurrentSelectedId() {
            try {
                return this.localValues[this.selectedIndex].id;
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
    v-on-clickaway="clickAway"
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
      <DropdownIcon :class="['icon', { 'open-up': openUp }]" />
    </div>
    <ul
      v-show="isExpanded"
      ref="ul"
      role="listbox"
      tabindex="-1"
      :class="{ 'open-up': openUp, 'with-placeholder': includePlaceholder }"
      :aria-activedescendant="isExpanded ? generateId('option', getCurrentSelectedId()) : false"
      @keydown="handleKeyDownList"
    >
      <li
        v-for="item of localValues"
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
@import "webapps-common/ui/css/variables";

.dropdown {
  position: relative;

  & .placeholder {
    color: var(--knime-stone-gray);
  }

  & [role=button] {
    margin: 0;
    padding: 0 38px 0 10px;
    font-size: 13px;
    height: 40px;
    line-height: 40px; /* to center text vertically */
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:focus,
    &:hover {
      outline: none;
      color: var(--knime-masala);

      & >>> svg {
        stroke: var(--knime-masala);
      }
    }
  }

  &.collapsed:hover {
    color: var(--knime-masala);
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

    &.open-up {
      transform: scaleY(-1);
    }
  }

  &:not(.collapsed) .icon {
    transform: scaleY(-1);

    &.open-up {
      transform: rotate(0deg);
    }
  }

  /* this selector is required to override some * rules interfere (overflow) - so do not simplify */
  & [role="listbox"] {
    overflow-y: auto;
    position: absolute;
    z-index: 2;
    max-height: calc(22px * 7); /* show max 7 items */
    font-size: 14px;
    min-height: 22px;
    min-width: 100%;
    width: fit-content;
    padding: 0;
    margin: -1px 0 1px 0;
    background: var(--knime-white);
    box-shadow: 0 1px 4px 0 var(--knime-gray-dark-semi);
    cursor: pointer;

    & [role="option"] {
      display: block;
      width: 100%;
      padding: 0 10px 0 10px;
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

    &.with-placeholder [role="option"]:first-child {
      color: var(--knime-stone);
    }

    &:focus {
      outline: none;
    }
  }

  & [role="listbox"].open-up {
    bottom: 40px;
  }

  & .noselect {
    user-select: none;
  }
}
</style>
