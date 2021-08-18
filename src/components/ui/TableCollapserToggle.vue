<script>
import DropdownIcon from '~/webapps-common/ui/assets/img/icons/arrow-next.svg?inline';
import BaseButton from '~/webapps-common/ui/components/BaseButton';

/**
 * Table data element wrapper for the animated collapser icon and it's animation.
 *
 * @emits collapserExpand when the element is clicked.
 */
export default {
    components: {
        DropdownIcon,
        BaseButton
    },
    props: {
        expanded: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        onTrigger(e) {
            this.$emit('collapserExpand', !this.expanded);
        }
    }
};
</script>

<template>
  <td class="collapser-cell">
    <div class="row-collapser-toggle">
      <BaseButton
        class="button"
        :aria-expanded="String(expanded)"
        @click.prevent="onTrigger"
      >
        <div class="dropdown">
          <DropdownIcon :class="['dropdown-icon', { flip: expanded }]" />
        </div>
      </BaseButton>
    </div>
  </td>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.row-collapser-toggle {
  height: 40px;

  & .button {
    min-height: 40px;
    position: relative;
    font-size: 18px;
    line-height: 26px;
    font-weight: bold;
    background-color: transparent;
    border: 0;
    outline: none;
    -webkit-appearance: none;
    color: inherit; /* Safari needs this */
    text-align: left;
    cursor: pointer;
    width: 30px;

    & .dropdown {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      padding: 3px;

      &:hover {
        background-color: var(--theme-button-function-background-color-hover);
      }

      & .dropdown-icon {
        width: 14px;
        height: 14px;
        stroke-width: calc(32px / 18); /* 14 is too thick */
        stroke: var(--knime-masala);
        transition: transform 0.2s ease-in-out;

        &.flip {
          transform: rotate(90deg);
        }
      }
    }

    &:focus .dropdown { /* whole button gets focus but only dropdown icon is styled */
      background-color: var(--theme-button-function-background-color-focus);
    }
  }
}
</style>
