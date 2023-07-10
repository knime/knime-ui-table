<script lang="ts">
import Checkbox from 'webapps-common/ui/components/forms/Checkbox.vue';
import DropdownIcon from 'webapps-common/ui/assets/img/icons/arrow-dropdown.svg';
import CircleHelpIcon from 'webapps-common/ui/assets/img/icons/circle-help.svg';
import MenuOptionsIcon from 'webapps-common/ui/assets/img/icons/menu-options.svg';
import type { Ref, PropType } from 'vue';
import { ref, toRefs, computed } from 'vue';
import { isMissingValue } from '@/util';
import useDropdownPopper from '../../composables/useDropdownPopper';
import useClickOutside from 'webapps-common/ui/composables/useClickOutside';
import getWrappedAroundNextElement from '@/util/getWrappedArondNextElement';
import useDropdownNavigation from 'webapps-common/ui/composables/useDropdownNavigation';
import useIdGeneration from '@/composables/useIdGeneration';
import type PossibleValue from '@/types/PossibleValue';

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
        CircleHelpIcon,
        MenuOptionsIcon
    },
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
            type: Array as PropType<Array<PossibleValue>>,
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
        modelValue: {
            type: Array as PropType<Array<string>>,
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
        },
        isFilter: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'columnReorder'],
    setup(props) {
        const { possibleValues } = toRefs(props);

        const toggleButton: Ref<HTMLElement | null> = ref(null);
        const optionsPopover: Ref<HTMLElement | null> = ref(null);
        const option: Ref<{$el: HTMLElement}[]> = ref([]);


        const isExpanded = ref(false);

        const getOffsetTopToWindow = (element: HTMLElement | null) => {
            let offsetTop = 0;
            while (element) {
                offsetTop += element.offsetTop;
                element = element.offsetParent as HTMLElement | null;
            }
            return offsetTop;
        };

        const scrollWindowTo = (element: HTMLElement | null) => {
            const toggleButtonElement = toggleButton.value;
            if (element === null || toggleButtonElement === null) {
                return;
            }
            if (props.isFilter) {
                /** In this case the list of element is scrollable and the computation below does not suffice.
                 *  Instead element.scrollIntoView() will guarantee that the element is visible.
                 */
                element.scrollIntoView();
                return;
            }
            const toggleButtonOffset = getOffsetTopToWindow(toggleButtonElement);
            const toggleButtonHeight = toggleButtonElement.scrollHeight;
            const elementOffsetToToggleButton = getOffsetTopToWindow(element);
            const elementOffsetTotal = toggleButtonOffset + toggleButtonHeight + elementOffsetToToggleButton;
            // We want a margin from the top / bottom of the screen to the current selected element
            const pageYOffset = 20;
            const pageYMin = elementOffsetTotal - pageYOffset;
            const pageYMax = elementOffsetTotal + element.scrollHeight + pageYOffset;
            if (window.scrollY + window.innerHeight < pageYMax) {
                const newYOffset = pageYMax - window.innerHeight;
                window.scrollTo(window.scrollX, newYOffset);
            } else if (window.scrollY > pageYMin) {
                window.scrollTo(window.scrollX, pageYMin);
            }
        };

        const getNextElement = (current: number | null, direction: 1 | -1) => {
            const listItems = option.value.map(({ $el }) => $el);
            const { element, index } = getWrappedAroundNextElement(current, direction, listItems);
            scrollWindowTo(element);
            const clickableInputElement = element.querySelector('input') as HTMLElement;
            return { index, onClick: () => clickableInputElement.click() };
        };
        
        const closeMenu = () => {
            isExpanded.value = false;
        };

        const { updatePopper } = useDropdownPopper({ popperTarget: optionsPopover, referenceEl: toggleButton });
        const { onKeydown, resetNavigation, currentIndex: selectedIndex } = useDropdownNavigation({
            getNextElement,
            getFirstElement: () => getNextElement(null, 1),
            getLastElement: () => getNextElement(null, -1),
            close: () => {
                closeMenu();
                resetNavigation();
            }
        });

        useClickOutside({ targets: [toggleButton, optionsPopover], callback: closeMenu }, isExpanded);
        const { activeDescendantId, generateOptionId } = useIdGeneration(
            computed(() => possibleValues.value.map(({ id }) => id)),
            selectedIndex,
            'control-multiselect'
        );
        return {
            updatePopper,
            onKeydown,
            resetNavigation,
            selectedIndex,
            isExpanded,
            option,
            optionsPopover,
            toggleButton,
            activeDescendantId,
            generateOptionId
        };
    },
    data() {
        return {
            checkedValue: this.modelValue,
            dragGhost: null,
            dragInd: null,
            hoverInd: null,
            listItemHeightCutoff: 15
        } as {
            checkedValue: string[],
            dragGhost: Node | null,
            dragInd: number | null,
            hoverInd: number | null,
            listItemHeightCutoff: number
        };
    },
    computed: {
        optionText() {
            if (this.checkedValue.length === 0 || this.lockPlaceholder) {
                return this.placeholder;
            }
            if (this.isFilter) {
                return `${this.checkedValue.length} selected`;
            }
            return this.possibleValues
                .filter(({ id }) => this.checkedValue.indexOf(id) > -1)
                .map(({ text, selectedText = text }) => selectedText)
                .join(', ');
        },
        withReorderEnabled() {
            // for filters, reordering of options does not make any sense
            return !this.isFilter;
        }
    },
    watch: {
        modelValue(newValue) {
            this.checkedValue = newValue;
        }
    },
    methods: {
        refocusToggleButton() {
            const toggleButtonElement = this.toggleButton;
            if (toggleButtonElement !== null) {
                toggleButtonElement.focus({ preventScroll: true });
            }
        },
        isMissingValue,
        onInput(value: string, toggled: boolean) {
            if (toggled) {
                if (this.checkedValue.indexOf(value) === -1) {
                    this.checkedValue.push(value);
                }
            } else {
                this.checkedValue = this.checkedValue.filter(x => x !== value);
            }
            this.refocusToggleButton();
            consola.trace('Multiselect value changed to', this.checkedValue);

            this.$emit('update:modelValue', this.checkedValue);
        },
        toggle() {
            this.isExpanded = !this.isExpanded;
            this.resetNavigation();
            this.updatePopper();
        },
        isChecked(itemId: string) {
            return this.checkedValue.indexOf(itemId) > -1;
        },
        onDragStart(event: Event, ind: number) {
            consola.trace('Drag triggered: ', event, ind);
            this.dragInd = ind;
            const dragElement = this.option[ind].$el;
            this.dragGhost = dragElement.cloneNode(true);
            document.body.appendChild(this.dragGhost);
        },
        onDragEnd() {
            if (this.hoverInd === null) {
                return;
            }
            let offset = this.hoverInd < this.possibleValues?.length - 1 ? 1 : 0;
            if (this.dragGhost) {
                document.body.removeChild(this.dragGhost);
                this.$emit('columnReorder', this.dragInd, this.hoverInd + offset);
            }
            this.dragGhost = null;
            this.dragInd = null;
            this.hoverInd = null;
            this.refocusToggleButton();
        },
        onDragOver(event: DragEvent, ind: number) {
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
    :class="['multiselect', { collapsed: !isExpanded, filter: isFilter }]"
    @dragleave="onDragLeave"
    @keydown.space.prevent="toggle"
  >
    <div
      ref="toggleButton"
      role="button"
      tabindex="0"
      :class="{ placeholder: !checkedValue.length || lockPlaceholder }"
      :aria-activedescendant="activeDescendantId"
      :aria-owns="activeDescendantId"
      @click="toggle"
      @keydown="isExpanded && onKeydown($event)"
    >
      {{ optionText }}
    </div>
    <DropdownIcon class="icon" />

    <Teleport to="body">
      <div
        v-show="isExpanded"
        ref="optionsPopover"
        role="options"
        :class="{filter: isFilter}"
        @dragleave.stop.prevent
      >
        <div
          v-if="withReorderEnabled && dragInd !== 0 && hoverInd === -1"
          class="drag-spacer drag-first"
        />
        <span
          v-for="(item, ind) of possibleValues.filter(({id}) => typeof id !== 'undefined')"
          :id="generateOptionId(item.id)"
          :key="`multiselect-${item.id}`"
          :class="['item-container', {
            'hovered': dragInd !== ind && hoverInd === ind,
            'focused': selectedIndex === ind,
            'drag-item': dragInd === ind
          }]"
          @dragover.stop.prevent="onDragOver($event, ind)"
        >
          <div
            v-if="withReorderEnabled"
            draggable="true"
            :class="['item-' + ind, 'drag-handle']"
            @dragstart="onDragStart($event, ind)"
            @dragend="onDragEnd()"
          >
            <MenuOptionsIcon class="drag left-drag" />
            <MenuOptionsIcon class="drag right-drag" />
          </div>
          <Checkbox
            ref="option"
            :tabindex="-1"
            :model-value="isChecked(item.id)"
            class="boxes"
            @update:model-value="onInput(item.id, $event)"
          >
            <CircleHelpIcon
              v-if="isMissingValue(item.id)"
              class="missing-value-icon"
            />
            <span v-else>{{ item.text }}</span>
          </Checkbox>
          <div
            v-if="withReorderEnabled && (dragInd !== null) && dragInd !== ind && dragInd - 1!== ind && hoverInd === ind"
            class="drag-spacer"
            @dragover.stop.prevent
            @dragenter.stop.prevent
          />
        </span>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="postcss">
.multiselect {
  position: relative;

  & [role="button"] {
    margin: 0;
    font-size: 13px;
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
    }
  }

  &:not(.filter) [role="button"] {
      padding: 0 38px 0 10px;
      font-weight: 500;
      height: 40px;
      line-height: 40px; /* to center text vertically */
  }

  &.filter [role="button"]{
      background-color: var(--knime-white);
      border: 1px solid var(--knime-stone-gray);
      padding: 0 24px 0 10px;
      font-weight: 400;
      height: 27px;
      line-height: 25px; /* to center text vertically */
      overflow-x: hidden;
  }

  &:not(.collapsed).filter [role="button"] {
    border-color: var(--knime-masala);
  }

  &.collapsed.filter:hover [role="button"] {
    background: var(--knime-silver-sand-semi);
  }


  & .icon {
    position: absolute;
    pointer-events: none;
    transition: transform 0.2s ease-in-out;
  }

  &:not(.collapsed) .icon {
    transform: scaleY(-1);
  }

  &:not(.filter) .icon {
    width: 18px;
    height: 18px;
    stroke-width: calc(32px / 18);
    stroke: var(--knime-dove-gray);
    right: 10px;
    top: 11px;
  }

  &.filter .icon {
    width: 12px;
    height: 12px;
    stroke-width: calc(32px / 12);
    stroke: var(--knime-masala);
    right: 7px;
    top: 8px;
  }
}

[role="options"] {
  width: fit-content;
  margin-top: -1px;
  background: var(--knime-white);
  box-shadow: 0 1px 4px 0 var(--knime-gray-dark-semi);

  & .item-container {
    position: relative;
    padding: 0 10px;
    display: block;

    &.focused,
    &.hovered,
    &:hover {
      background-color: var(--knime-silver-sand-semi);
    }

  }

  & .boxes {
    display: block;
    position: relative;
    color: var(--knime-masala);

    & .missing-value-icon {
      width: 14px;
      height: 14px;
      stroke-width: calc(32px / 14);
      stroke: var(--theme-color-kudos);
      vertical-align: text-top;
    }
  }
}

[role="options"].filter {
  max-height: calc(32px * 7); /* show max 7 items */
  overflow-y: auto;
  position: absolute;
  z-index: 2;
  width: fit-content;
  margin-top: -1.5px;
  box-shadow: 0 1px 4px 0 var(--knime-gray-dark-semi);

  & .boxes {
    height: 32px;
    overflow-y: hidden;
    padding-top: 8px; /** Move content down to appear centered */
    &:deep(span::before) {
      top: 9px; /** Move absolute positioned checkbox down to appear centered */
    }

    &:deep(span::after) {
      top: 9px; /** Move absolute positioned checkbox checked icon down to appear centered */
    }
  }
}

[role="options"]:not(.filter) {
  & .item-container {
    padding-top: 5px;
  
    &.drag-item {
      background-color: var(--knime-silver-sand);
      opacity: 0.5;
    }

    & .drag-handle {
      cursor: move;
      height: 0;
      width: 0;
  
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
      margin-left: 16px;
      font-size: 13px;
      font-weight: 500;
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
</style>
