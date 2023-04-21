<script lang = "ts">
import RecycleScroller from 'vue-virtual-scroller/src/components/RecycleScroller.vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export default {
    components: {
        RecycleScroller
    },
    data() {
        return {
            numRows: 200,
            numColumns: 200,
            defaultWidth: 50,
            defaultHeight: 50,
            emptyAbove: 1,
            emptyBelow: 1,
            emptyLeft: 1,
            emptyRight: 1,
            totalWidth: 0
        };
    },
    computed: {
        scrollData() {
            return Array.from({ length: this.numRows }, (_v, i: number) => this.getRow(i));
        },
        emptyRow() {
            return { size: this.defaultHeight,
                data: Array.from({ length: this.numColumns }, (_v, j: number) => (
                    { id: j, size: this.getPseudoRandomSizeFromIndex(j) }
                )) };
        }
    },
    methods: {
        getRow(i: number) {
            return { id: `row${i}`,
                size: this.getPseudoRandomSizeFromIndex(i),
                data: Array.from({ length: this.numColumns }, (_v, j: number) => (
                    { id: `row${i}_${j}`, data: `row${i}_${j}`, size: this.getPseudoRandomSizeFromIndex(j) }
                )) };
        },
        setTotalWidth(totalWidth: number) {
            this.totalWidth = totalWidth;
        },
        getPseudoRandomSizeFromIndex(index: number) {
            return (index % 10) * 10 + 100;
        }
    }
};
</script>

<template>
  <h4>Horizontal virtual scrollers</h4>
  <RecycleScroller
    #default="{ item: row }"
    class="body"
    :style="{'--current-body-width': `${totalWidth}px`}"
    :min-item-size="defaultHeight"
    :items="scrollData"
    :empty-item="emptyRow"
    :num-items-above="emptyAbove"
    :num-items-below="emptyBelow"
  >
    <RecycleScroller
      #default="{item: cell}"
      class="row"
      :style="{height: `${row.size}px`}"
      :min-item-size="defaultWidth"
      :items="row.data"
      direction="horizontal"
      page-mode
      :num-items-above="emptyLeft"
      :num-items-below="emptyRight"
      :empty-item="{size: defaultWidth}"
      @total-size="setTotalWidth"
    >
      <button
        :style="{width: `${cell.size}px`, height: `${row.size}px`}"
      >
        {{ cell.data ? cell.data: "-" }}
      </button>
    </RecycleScroller>
  </RecycleScroller>
</template>


<style scoped>
  @import url("webapps-common/ui/css");

  .body {
    height: 400px;
  }
  
  .body > :deep(.vue-recycle-scroller__item-wrapper) {
    /**
    * See https://github.com/Akryum/vue-virtual-scroller/issues/242#issuecomment-1125306766
    */
    width: var(--current-body-width);
  }

</style>
