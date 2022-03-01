<script>
import PageControls from './PageControls';

/**
 * Base table header component with table page controls on the left of the table row
 * and a slot for additional controls on the right.
 *
 * @emits nextPage
 * @emits prevPage
 */
export default {
    components: {
        PageControls
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
        onNextPage() {
            consola.debug('Next Page');
            this.$emit('nextPage');
        },
        onPrevPage() {
            consola.debug('Prev Page');
            this.$emit('prevPage');
        }
    }
};
</script>

<template>
  <thead>
    <tr>
      <PageControls
        :total-items="pageConfig.tableSize"
        :current-items="pageConfig.currentSize"
        :page-size="pageConfig.pageSize"
        :current-page="pageConfig.currentPage"
        @nextPage="onNextPage"
        @prevPage="onPrevPage"
      />
      <th class="right-controls">
        <slot />
      </th>
    </tr>
  </thead>
</template>

<style lang="postcss" scoped>

thead {
  & tr {
    padding: 0;
    margin: 0;
    margin-top: -3px;
    margin-bottom: -2px;
    height: 40px;

    & th {
      padding: 0;
      font-weight: 500;
      color: var(--knime-dove-gray);

      &.right-controls {
        display: flex;
        align-items: center;
        margin-left: auto;
        justify-content: flex-end;
        text-align: left;

        & span {
          line-height: 50px;
        }
      }
    }
  }
}
</style>
