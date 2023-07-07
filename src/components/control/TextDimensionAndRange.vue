<script>
import isSinglePage from '@/util/isSinglePage';

/**
 * The functionality to show the dimension and range text of the PageControls.
 */
export default {
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
        },
        pageRangeStart: {
            type: Number,
            default: 0
        },
        pageRangeEnd: {
            type: Number,
            default: 0
        }
    },
    computed: {
        isPaginationEnabled() {
            return !isSinglePage(this.currentItems, this.pageSize);
        },
        shouldAppendTotalItems() {
            return this.currentItems !== this.totalItems && this.totalItems > 0 && this.currentItems > 0;
        }
    }
};
</script>

<template>
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
</template>

<style scoped>
   span {
    margin-right: 5px;
    white-space: pre;
  }
</style>
