<script lang="ts">
import CircleHelpIcon from "@knime/styles/img/icons/circle-help.svg";
import DropdownIcon from "@knime/styles/img/icons/arrow-dropdown.svg";
import { ref, computed, toRefs, inject } from "vue";
import type { Ref, PropType } from "vue";
import { isMissingValue } from "@/util";
import { useDropdownFloating } from "./composables/useDropdownFloating";
import { useDropdownNavigation, useClickOutside } from "@knime/components";
import getWrappedAroundNextElement from "@/util/getWrappedArondNextElement";
import type PossibleValue from "@/types/PossibleValue";
import { useIdGeneration } from "./composables/useIdGeneration";
import { useScrollToElement } from "./composables/useScrollToElement";

/**
 * A dropdown component specifically styled for the top and bottom control bars of the table
 * component with additional control over the relative direction of opening for the options
 * list.
 *
 * @emits input event when an option is selected.
 */
export default {
  components: {
    CircleHelpIcon,
    DropdownIcon,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: null,
    },
    ariaLabel: {
      type: String,
      required: true,
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
      type: Array as PropType<PossibleValue[]>,
      default: () => [],
    },
    formatter: {
      type: Function,
      default: (item: string) => item,
    },
    includePlaceholder: {
      type: Boolean,
      default: false,
    },
    openUp: {
      type: Boolean,
      default: false,
    },
    isFilter: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props) {
    const button = ref(null);
    const ul: Ref<HTMLUListElement | null> = ref(null);
    const options: Ref<HTMLLIElement[] | null> = ref([]);
    const isExpanded = ref(false);
    const shadowRoot = inject<ShadowRoot | null>("shadowRoot", null);

    const { scrollTo } = useScrollToElement({ toggleButton: button });

    const getNextElement = (current: number | null, direction: 1 | -1) => {
      const listItems = options.value as HTMLLIElement[];
      const { element, index } = getWrappedAroundNextElement(
        current,
        direction,
        listItems,
      );
      scrollTo(element);
      return { index, onClick: () => element.click() };
    };

    const getFirstElement = () => getNextElement(null, 1);

    const getLastElement = () => getNextElement(null, -1);

    const closeMenu = () => {
      isExpanded.value = false;
    };

    const { update: updateFloating, floatingStyles } = useDropdownFloating(
      button,
      ul,
      props.openUp,
    );
    const {
      onKeydown,
      resetNavigation,
      currentIndex: selectedIndex,
    } = useDropdownNavigation({
      getNextElement,
      getFirstElement,
      getLastElement,
      close: closeMenu,
    });

    useClickOutside(
      {
        targets: [button, ul],
        callback: () => {
          closeMenu();
          resetNavigation();
        },
      },
      isExpanded,
    );
    const { possibleValues, includePlaceholder, placeholder } = toRefs(props);
    const localValues = computed(() => {
      const values = possibleValues.value.filter(
        ({ id }) => typeof id !== "undefined",
      );
      if (includePlaceholder.value) {
        values.unshift({
          id: placeholder.value,
          text: placeholder.value,
        });
      }
      return values;
    });
    const ids = computed(() => localValues.value.map(({ id }) => id));

    const { activeDescendantId, buttonId, generateOptionId } = useIdGeneration(
      ids,
      selectedIndex,
      "dropdown-input",
    );
    return {
      updateFloating,
      floatingStyles,
      shadowRoot,
      onKeydown,
      resetNavigation,
      generateOptionId,
      localValues,
      selectedIndex,
      isExpanded,
      options,
      button,
      ul,
      activeDescendantId,
      buttonId,
    };
  },
  computed: {
    showPlaceholder() {
      const noModelValuePresent =
        typeof this.modelValue === "undefined" || this.modelValue === "";
      if (this.includePlaceholder) {
        return noModelValuePresent || this.modelValue === this.placeholder;
      } else {
        return noModelValuePresent;
      }
    },
    displayTextMap() {
      let map: Record<string, string> = {};
      for (let value of this.localValues) {
        map[value.id] = value.text;
      }
      return map;
    },
    displayText() {
      if (this.showPlaceholder) {
        return this.placeholder;
      } else if (this.displayTextMap.hasOwnProperty(this.modelValue)) {
        return this.formatter(this.displayTextMap[this.modelValue]);
      } else {
        return `(MISSING) ${this.modelValue}`;
      }
    },
  },
  methods: {
    isCurrentValue(candidate: string) {
      return this.modelValue === candidate;
    },
    isMissingValue,
    isFocusedValue(index: number) {
      return this.selectedIndex === index;
    },
    setSelected(value: string) {
      consola.trace("ListBox setSelected on", value);
      if (this.includePlaceholder && value === this.placeholder) {
        value = "";
      }
      this.$emit("update:modelValue", value);
    },
    onOptionClick(value: string) {
      this.setSelected(value);
      this.isExpanded = false;
      this.updateFloating();
    },
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
      this.resetNavigation();
      this.updateFloating();
    },
  },
};
</script>

<template>
  <div
    :class="['dropdown', { filter: isFilter, collapsed: !isExpanded }]"
    @keydown.space.prevent="toggleExpanded"
  >
    <div
      :id="buttonId"
      ref="button"
      role="button"
      tabindex="0"
      aria-haspopup="listbox"
      :class="{ placeholder: showPlaceholder }"
      :aria-label="ariaLabel"
      :aria-labelledby="buttonId"
      :aria-expanded="isExpanded"
      :aria-activedescendant="activeDescendantId"
      :aria-owns="activeDescendantId"
      @click="toggleExpanded"
      @keydown="isExpanded && onKeydown($event)"
    >
      <CircleHelpIcon
        v-if="isMissingValue(displayText)"
        class="missing-value-icon"
      />
      <span v-else>{{ displayText }}</span>
      <DropdownIcon :class="['icon', { 'open-up': openUp }]" />
    </div>
    <Teleport :to="shadowRoot || 'body'">
      <ul
        v-show="isExpanded"
        ref="ul"
        role="listbox"
        tabindex="-1"
        :style="floatingStyles"
        :class="{
          'open-up': openUp,
          'with-placeholder': includePlaceholder,
          filter: isFilter,
        }"
      >
        <li
          v-for="(item, index) in localValues"
          :id="generateOptionId(item.id)"
          :key="`listbox-${item.id}`"
          ref="options"
          role="option"
          :title="item.text"
          :class="{
            focused: isFocusedValue(index),
            selected: isCurrentValue(item.id),
            noselect: true,
            empty: item.text?.trim() === '',
          }"
          :aria-selected="isCurrentValue(item.id)"
          @click="onOptionClick(item.id)"
        >
          <CircleHelpIcon
            v-if="isMissingValue(item.id)"
            class="missing-value-icon"
          />
          <span v-else-if="item.text !== undefined">{{ item.text }}</span>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<style lang="postcss" scoped>
.dropdown {
  position: relative;

  & .placeholder {
    color: var(--knime-stone-gray);
  }

  &.filter {
    background-color: var(--knime-white);

    &.collapsed:hover {
      background-color: var(--knime-silver-sand-semi);
    }
  }

  & [role="button"] {
    margin: 0;
    padding: 0 38px 0 10px;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    & .missing-value-icon {
      width: 14px;
      height: 14px;
      stroke-width: calc(32px / 14);
      stroke: var(--theme-color-kudos);
      position: absolute;
      left: 10px;
      top: 7px;
    }
  }

  &.filter [role="button"] {
    border: 1px solid var(--knime-stone-gray);
    font-weight: 400;
    height: 27px;
    line-height: 26px; /* to center text vertically */
  }

  &:not(.filter) [role="button"] {
    height: 40px;
    line-height: 40px; /* to center text vertically */
  }

  & [role="button"]:focus {
    outline: none;
  }

  &.filter [role="button"]:focus {
    border-color: var(--knime-masala);
  }

  &:not(.filter) [role="button"]:focus,
  &:not(.filter) [role="button"]:hover {
    color: var(--knime-masala);

    & :deep(svg) {
      stroke: var(--knime-masala);
    }
  }

  &.collapsed:hover {
    color: var(--knime-masala);
  }

  & .icon {
    position: absolute;
    pointer-events: none;
    transition: transform 0.2s ease-in-out;

    &.open-up {
      transform: scaleY(-1);
    }
  }

  &.filter .icon {
    width: 12px;
    height: 12px;
    stroke-width: calc(32px / 12);
    stroke: var(--knime-masala);
    right: 7px;
    top: 8px;
  }

  &:not(.filter) .icon {
    width: 18px;
    height: 18px;
    stroke-width: calc(32px / 18);
    stroke: var(--knime-dove-gray);
    right: 10px;
    top: 11px;
  }

  &:not(.collapsed) .icon {
    transform: scaleY(-1);

    &.open-up {
      transform: rotate(0deg);
    }
  }
}

/* this selector is required to override some * rules interfere (overflow) - so do not simplify */
[role="listbox"] {
  overflow-y: auto;
  z-index: var(--z-index-control-dropdown);
  max-height: calc(22px * 7); /* show max 7 items */
  min-height: 22px;
  width: fit-content;
  padding: 0;
  background: var(--knime-white);
  cursor: pointer;

  &:not(.filter) {
    font-size: 14px;
    font-weight: 500;
    margin: -1px 0 1px;
    box-shadow: 0 1px 4px 0 var(--knime-gray-dark-semi);
  }

  &.filter {
    font-size: 13px;
    font-weight: 400;
    margin: -1.5px 0 1px;
    box-shadow: 0 1px 5px 0 var(--knime-gray-dark);
  }

  &.open-up {
    bottom: 40px;
  }

  & .noselect {
    user-select: none;
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

    &.selected {
      background: var(--theme-dropdown-background-color-selected);
      color: var(--theme-dropdown-foreground-color-selected);
    }

    &:hover,
    &.focused {
      background: var(--theme-dropdown-background-color-hover);
      color: var(--theme-dropdown-foreground-color-hover);
    }

    & .missing-value-icon {
      width: 14px;
      height: 14px;
      stroke-width: calc(32px / 14);
      stroke: var(--theme-color-kudos);
      vertical-align: middle;
    }
  }

  &.with-placeholder [role="option"]:first-child {
    color: var(--knime-stone);
  }

  &:focus {
    outline: none;
  }
}
</style>
