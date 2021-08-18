<script>
import TablePageControl from './TablePageControl';

/**
 * Base table header component with table page controls on the left of the table row
 * and a slot for additional controls on the right.
 *
 * @emits nextPage
 * @emits prevPage
 */
export default {
    components: {
        TablePageControl
    },
    props: {
        totalItems: {
            type: Number,
            default: 0
        },
        currentItems: {
            type: Number,
            default: 0
        },
        pageSize: {
            type: Number,
            default: 0
        },
        currentPage: {
            type: Number,
            default: 0
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
      <TablePageControl
        :total-items="totalItems"
        :current-items="currentItems"
        :page-size="pageSize"
        :current-page="currentPage"
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
@import "webapps-common/ui/css/variables";

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
