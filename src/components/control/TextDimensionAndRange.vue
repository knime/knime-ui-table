<script>
import isSinglePage from "@/util/isSinglePage";

/**
 * The functionality to show the dimension and range text of the PageControls.
 */
export default {
  props: {
    totalItems: {
      type: Number,
      default: 0,
    },
    currentItems: {
      type: Number,
      default: 0,
    },
    pageSize: {
      type: Number,
      default: 0,
    },
    currentPage: {
      type: Number,
      default: 0,
    },
    columnCount: {
      type: Number,
      default: null,
    },
    showTableSize: {
      type: Boolean,
      default: true,
    },
    pageRangeStart: {
      type: Number,
      default: 0,
    },
    pageRangeEnd: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    hasMultiplePages() {
      return !isSinglePage(this.currentItems, this.pageSize);
    },
    shouldAppendTotalItems() {
      return (
        this.currentItems !== this.totalItems &&
        this.totalItems > 0 &&
        this.currentItems > 0
      );
    },
  },
};
</script>

<template>
  <span v-if="hasMultiplePages && currentItems">
    Rows: {{ pageRangeStart }}-{{ pageRangeEnd }} of {{ currentItems }}
  </span>
  <template v-if="showTableSize">
    <span v-if="currentItems === 0">
      No data {{ `${totalItems ? `(${totalItems} hidden)` : ""}` }}
    </span>
    <template v-else>
      <span v-if="!hasMultiplePages"> Rows: {{ currentItems }} </span>
      <span v-else-if="shouldAppendTotalItems"> ({{ totalItems }} total) </span>
    </template>
    <span v-if="columnCount">
      {{ `   |   Columns: ${columnCount}` }}
    </span>
  </template>
</template>

<style scoped>
span {
  margin-right: 5px;
  white-space: pre;
}
</style>
