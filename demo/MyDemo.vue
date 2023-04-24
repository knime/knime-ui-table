<script lang = "ts">
import TryHorizontalVirtualScrolling from './TryHorizontalVirtualScrolling.vue';
import TryRowHeights from './TryRowHeights.vue';
import TryKeyboardNav from './TryKeyboardNav.vue';

export default {
    components: {
        TryHorizontalVirtualScrolling,
        TryRowHeights,
        TryKeyboardNav
    },
    data() {
        return {
            mode: 1,
            numModes: 3
        };
    },
    methods: {
        nextMode() {
            this.mode += 1;
            if (this.mode > this.numModes) {
                this.mode = 1;
            }
        }
    }
};
</script>

<template>
  <button @click="nextMode">Change case</button>
  <div
    class="demo"
  >
    <TryHorizontalVirtualScrolling v-if="mode == 1" />
    <TryRowHeights v-if="mode == 2" />
    <TryKeyboardNav v-if="mode == 3" />
  </div>
</template>

<style scoped>

  .demo {
    border: 1px solid black;
    padding: 100px;
  }

</style>
