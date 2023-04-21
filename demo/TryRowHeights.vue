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
            numColumns: 10,
            sizesOverrides: {}
        } as {
          numRows: number,
          numColumns: number,
          sizesOverrides: Record<number, number>
        };
    },
    computed: {
        scrollData() {
            return Array.from({ length: this.numRows }, (_v, i: number) => this.getRow(i));
        },
        totalWidth() {
            return this.numColumns * 100;
        }
    },
    methods: {
        getRow(i: number) {
            return { id: `row${i}`,
                index: i,
                size: Math.max(this.sizesOverrides[i] || 50, 50),
                data: Array.from({ length: this.numColumns }, (_v, j: number) => (
                    { id: `row${i}_${j}`, data: `row${i}_${j}` }
                )) };
        }
    }
};
</script>

<template>
  <h4>Adjustable row height</h4>
  <RecycleScroller
    class="body"
    :min-item-size="10"
    :items="scrollData"
    :empty-item="{data: [{data: 'empty'}], size: 50, isEmpty: true}"
    :num-items-above="20"
    :num-items-below="200000"
    :style="{'--current-body-width': `${totalWidth}px`}"
  >
    <template #default="{ item:row }">
      <button
        v-if="row.isEmpty"
        :style="{width: '1100px'}"
      >
        empty row
      </button>
      <div
        v-else
        :style="{height: `${Math.max(sizesOverrides[row.index] || 50, 50)}px`}"
        class="row"
      >
        <button>
          <input
            v-model="sizesOverrides[row.index]"
            type="number"
          >
        </button>
        <button
          v-for="x in row.data"
        >
          {{ x.data }}
        </button>
      </div>
    </template>
  </RecycleScroller>
</template>


<style scoped>
  @import url("webapps-common/ui/css");


  button {
    min-height: 50px;
    height: 100%;
    width: 100px;
  }
  
  input {
    width: 80px;
  }

  .row {
    height: 50px;
    width: 1100px;
  }

  .body {
    height: 800px;
  }
  
  .body > :deep(.vue-recycle-scroller__item-wrapper) {
    width: var(--current-body-width)
  }

</style>
