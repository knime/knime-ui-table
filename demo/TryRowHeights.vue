<script lang = "ts">
import RecycleScroller from 'vue-virtual-scroller/src/components/RecycleScroller.vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import DynamicScroller from 'vue-virtual-scroller/src/components/DynamicScroller.vue';
import DynamicScrollerItem from 'vue-virtual-scroller/src/components/DynamicScrollerItem.vue';

export default {
    components: {
        DynamicScroller,
        DynamicScrollerItem
    },
    data() {
        return {
            numRows: 20000,
            numColumns: 200,
            sizes: Array.from({ length: 20000 }, () => 50)
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
                index: i,
                data: Array.from({ length: this.numColumns }, (_v, j: number) => (
                    { id: `row${i}_${j}`, data: `row${i}_${j}` }
                )) };
        },
        logSizes() {
            console.log('sizes', this.sizes);
        }
    }
};
</script>

<template>
  <DynamicScroller
    class="body"
    :min-item-size="10"
    :items="scrollData"
  >
    <template #default="{ item:row, active }">
      <DynamicScrollerItem
        :item="row"
        :active="active"
      >
        <div
          :style="{height: `${sizes[row.index]}px`}"
          class="row"
        >
          <button>
            <input
              v-model="sizes[row.index]"
              type="number"
            >
          </button>
          <button
            v-for="x in row.data"
          >
            {{ x.data }}
          </button>
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
  <button @click="logSizes">Log sizes</button>
</template>


<style>
  @import url("webapps-common/ui/css");

  button {
    height: 100%;
    width: 100px;
  }
  
  input {
    width: 80px;
  }

  .row {
    height: 50px;
    width: 20100px;
  }

  .body {
    height: 800px;
  }
  
  /*.body > .vue-recycle-scroller__item-wrapper {
    width: 20000px !important;
  }*/

</style>
