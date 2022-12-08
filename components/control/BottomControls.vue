<script>
import BaseControls from './BaseControls.vue';
import ControlDropdown from './ControlDropdown.vue';

/**
 * Table controls for the bottom of the table optionally consisting of page controls
 * and a drop-"up" selection input for table page size.
 *
 * @emits pageSizeUpdate when the page size it updated.
 * @emits $listeners from @see BaseControls
 */
export default {
    components: {
        BaseControls,
        ControlDropdown
    },
    props: {
        pageConfig: {
            type: Object,
            default: () => ({}),
            validate(pageConfig) {
                if (typeof pageConfig !== 'object') {
                    return false;
                }
                const requiredProperties = ['currentSize', 'tableSize', 'pageSize', 'currentPage', 'possiblePageSizes'];
                return requiredProperties.every(key => pageConfig.hasOwnProperty(key));
            }
        }
    },
    emits: ['pageSizeUpdate'],
    methods: {
        createText(size) {
            return `${size.toString()} per page`;
        },
        parseSize(sizeText) {
            let strSize = sizeText.split(' per')[0].trim();
            return parseInt(strSize, 10);
        },
        getSelectItems(itemArr) {
            return itemArr?.length ? itemArr.map(item => ({ id: item, text: item })) : [];
        },
        onPageSizeSelect(newPageSize) {
            consola.debug('Updated table page size: ', newPageSize);
            this.$emit('pageSizeUpdate', this.parseSize(newPageSize));
        }
    }
};
</script>

<template>
  <BaseControls
    class="base-controls"
    v-bind="{...$props, ...$attrs}"
  >
    <ControlDropdown
      open-up
      :model-value="createText(pageConfig.pageSize)"
      :aria-label="'Choose page size'"
      :possible-values="getSelectItems(pageConfig.possiblePageSizes.map(num => createText(num)))"
      class="dropdown-controls"
      placeholder="Items per page"
      @update:model-value="onPageSizeSelect"
    />
  </BaseControls>
</template>

<style lang="postcss" scoped>
.base-controls {
  & span {
    line-height: 50px;
  }

  & :deep(.function-button) {
    position: relative;
    margin: none;
    height: 28px;
    width: 28px;
    stroke-width: calc(32px / 20);
    stroke: var(--knime-dove-gray);
    top: 0;

    &:hover,
    &:focus {
      /* needed to override function-button styles */
      background: unset;
    }
  }

  & :deep(.dropdown [role="button"]) {
    border: none;
  }

  & :deep(.dropdown ul) {
    width: fit-content;
  }
}
</style>
