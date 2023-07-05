<script>
import FunctionButton from 'webapps-common/ui/components/FunctionButton.vue';
import ArrowNextIcon from 'webapps-common/ui/assets/img/icons/arrow-next.svg';
import ArrowPrevIcon from 'webapps-common/ui/assets/img/icons/arrow-prev.svg';
import isSinglePage from '@/util/isSinglePage';

/**
 * Base table data element with table page controls for the left side of a table header.
 *
 * @emits nextPage event.
 * @emits prevPage event.
 */
export default {
    components: {
        ArrowNextIcon,
        FunctionButton,
        ArrowPrevIcon
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
        },
        columnCount: {
            type: Number,
            default: null
        },
        showTableSize: {
            type: Boolean,
            default: true
        }
    },
    emits: ['nextPage', 'prevPage'],
    computed: {
        isPaginationEnabled() {
            return !isSinglePage(this.currentItems, this.pageSize);
        },
        shouldAppendTotalItems() {
            return this.currentItems !== this.totalItems && this.totalItems > 0 && this.currentItems > 0;
        },
        pageRangeStart() {
            return 1 + ((this.currentPage * this.pageSize) - this.pageSize);
        },
        pageRangeEnd() {
            return Math.min(this.currentPage * this.pageSize, this.currentItems);
        },
        hasNextPage() {
            return this.pageRangeEnd < this.currentItems;
        },
        hasPreviousPage() {
            return this.pageRangeStart > 1;
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
  <th class="left-controls">
    <template v-if="currentItems">
      <span v-if="showTableSize && !isPaginationEnabled">
        Rows: {{ currentItems }}
      </span>
      <span v-else-if="isPaginationEnabled">
        Rows: {{ pageRangeStart }}-{{ pageRangeEnd }} of {{ currentItems }}
      </span>
      <span v-if="shouldAppendTotalItems && showTableSize">
        ({{ totalItems }} total)
      </span>
    </template>
    <span v-else-if="showTableSize">
      No data {{ `${totalItems ? `(${totalItems} hidden)` : ''}` }}
    </span>
    <span v-if="columnCount && showTableSize">
      {{ `   |   Columns: ${columnCount}` }}
    </span>
    <FunctionButton
      v-if="hasNextPage || hasPreviousPage"
      :disabled="!hasPreviousPage"
      @click="onPrevPage"
    >
      <ArrowPrevIcon />
    </FunctionButton>
    <FunctionButton
      v-if="hasNextPage || hasPreviousPage"
      :disabled="!hasNextPage"
      @click="onNextPage"
    >
      <ArrowNextIcon />
    </FunctionButton>
  </th>
</template>

<style lang="postcss" scoped>
th.left-controls {
  display: flex;
  align-items: center;

  & span {
    margin-right: 5px;
    white-space: pre;
  }

  & :deep(.function-button) {
    display: flex;
    align-self: stretch;
    align-items: center;
    height: 40px;
    width: 30px;
    border-radius: 0;
    transition: background-color 0.15s;
  }
}
</style>
