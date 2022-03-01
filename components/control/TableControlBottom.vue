<script>
import TableControlsBase from './TableControlBase';
import TableControlDropdown from './TableControlDropdown';

/**
 * Table controls for the bottom of the table optionally consisting of page controls
 * and a drop-"up" selection input for table page size.
 *
 * @emits pageSizeUpdate when the page size it updated.
 * @emits $listeners from @see TableControlsBase
 */
export default {
    components: {
        TableControlsBase,
        TableControlDropdown
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
  <TableControlsBase
    class="base-controls"
    v-bind="$props"
    v-on="$listeners"
  >
    <TableControlDropdown
      open-up
      :value="createText(pageConfig.pageSize)"
      :aria-label="'Choose page size'"
      :possible-values="getSelectItems(pageConfig.possiblePageSizes.map(num => createText(num)))"
      class="dropdown-controls"
      placeholder="Items per page"
      @input="onPageSizeSelect"
    />
  </TableControlsBase>
</template>

<style lang="postcss" scoped>

.base-controls {
  & span {
    line-height: 50px;
  }

  & >>> .function-button {
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

  & >>> .dropdown [role=button] {
    border: none;
  }

  & >>> .dropdown ul {
    width: fit-content;
  }
}
</style>
