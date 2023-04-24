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
            currentRow: 0,
            numItems: 7,
            rowHeight: 50
        };
    },
    computed: {
        scrollData() {
            return Array.from({ length: this.numRows }, (_v, i: number) => ({ data: i, id: i }));
        },
        scrollerHeight() {
            return this.numItems * this.rowHeight;
        }
    },
    methods: {
        scrollToNext() {
            const scroller = this.$refs.scroller as any;
            this.currentRow += 1;
            scroller.scrollToItem(this.currentRow - 7);
        }
    }
};
</script>

<template>
  <h4>KeyboardNavigation</h4>
  <button @click="scrollToNext">Next element</button>
  <RecycleScroller
    ref="scroller"
    :style="{height: scrollerHeight}"
    class="body"
    :min-item-size="rowHeight"
    :items="scrollData"
    :empty-item="{data: [{data: 'empty'}], size: 50, isEmpty: true}"
  >
    <template #default="{ item }">
      <button :style="{...{height: rowHeight}, ...item.id === currentRow ? {background: 'black', color: 'white'} : {}}">{{ item.data }}</button>
    </template>
  </RecycleScroller>
</template>


<style scoped>
  @import url("webapps-common/ui/css");


  button {
    height: 50px;
    width: 100%;
  }
  
  input {
    width: 80px;
  }

  .row {
    height: 50px;
    width: 1100px;
  }

  .body {
    height: 400px;
  }

</style>
