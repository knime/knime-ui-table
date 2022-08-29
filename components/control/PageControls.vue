<script>
import FunctionButton from '~/webapps-common/ui/components/FunctionButton.vue';
import ArrowNextIcon from '~/webapps-common/ui/assets/img/icons/arrow-next.svg?inline';
import ArrowPrevIcon from '~/webapps-common/ui/assets/img/icons/arrow-prev.svg?inline';

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
        }
    },
    computed: {
        rangeText() {
            if (this.currentItems) {
                let baseInfo;
                if (this.pageSize === this.totalItems) {
                    baseInfo = `Rows: ${this.totalItems}`;
                } else {
                    baseInfo = `Showing ${this.pageRangeStart}-${this.pageRangeEnd} of ${this.currentItems}`;
                    if (this.currentItems !== this.totalItems && this.totalItems > 0 && this.currentItems > 0) {
                        baseInfo += ` (${this.totalItems} total)`;
                    }
                }
                return baseInfo;
            }
            return `No data${this.totalItems ? ` (${this.totalItems} hidden)` : ''}`;
        },
        dimensionText() {
            if (this.columnCount) {
                return `   |   Columns: ${this.columnCount}`;
            }
            return '';
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
    <span>
      {{ rangeText + dimensionText }}
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

  & >>> .function-button {
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
