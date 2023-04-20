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
            numColumns: 200
        };
    },
    computed: {
        scrollData() {
            return Array.from({ length: this.numRows }, (_v, i: number) => this.getRow(i));
        }
    },
    methods: {
        getRow(i: number) {
            return { id: `row${i}`,
                data: Array.from({ length: this.numColumns }, (_v, j: number) => (
                    { id: `row${i}_${j}`, data: `row${i}_${j}` }
                )) };
        }
    }
};
</script>

<template>
  <RecycleScroller
    #default="{ item: row }"
    class="body"
    :item-size="50"
    :items="scrollData"
    :empty-item="{data: Array.from({ length: numColumns }, (_v,j) => ({id: j, data: ''}))}"
    :num-items-above="0"
    :num-items-below="0"
  >
    <RecycleScroller
      #default="{item: cell}"
      class="row"
      :item-size="100"
      :items="row.data"
      direction="horizontal"
      :page-mode="true"
      :num-items-above="0"
      :num-items-below="0"
      :empty-item="{data: ''}"
    >
      <button>{{ cell.data }}</button>
    </RecycleScroller>
  </RecycleScroller>
</template>


<style>
  @import url("webapps-common/ui/css");

  button {
    height: 50px;
    width: 100px;
  }

  .row {
    height: 50px;
    width: 100%;
  }

  .body {
    height: 800px;
  }
  
  .body > .vue-recycle-scroller__item-wrapper {
    width: 20000px !important;
  }

</style>
