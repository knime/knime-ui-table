<script>
import PopoverPageControls from './PopoverPageControls.vue';

/**
 * This popover rendering component is used to display the content from arrays.
 * The component uses page controls to allow users to switch between items in the
 * collection.
 */
export default {
    components: {
        PopoverPageControls
    },
    props: {
        data: {
            type: Array,
            default: null
        }
    },
    data() {
        return {
            currentItemNumber: 0
        };
    },
    computed: {
        formattedData() {
            if (this.data?.length) {
                let parsedData = this.data
                    .filter(item => typeof item !== 'undefined' && item !== null)
                    .map(item => this.formatItem(item));
                return parsedData;
            }
            return null;
        },
        numberItems() {
            return this.formattedData?.length;
        },
        currentItem() {
            return this.formattedData?.[this.currentItemNumber];
        }
    },
    methods: {
        formatItem(item) {
            if (typeof item === 'object' || Array.isArray(item)) {
                // eslint-disable-next-line no-undefined
                return JSON.stringify(item, undefined, 2);
            }
            return item;
        },
        onPageChange(change) {
            let nextItem = this.currentItemNumber + change;
            if (nextItem >= this.numberItems) {
                nextItem = 0;
            } else if (nextItem < 0) {
                nextItem = this.numberItems - 1;
            }
            this.currentItemNumber = nextItem;
        }
    }
};
</script>

<template>
  <div
    v-if="formattedData"
    class="wrapper"
  >
    <div class="content">
      {{ currentItem }}
    </div>
    <PopoverPageControls
      v-if="numberItems > 1"
      :total-pages="numberItems"
      :current-page="currentItemNumber"
      class="controls"
      @nextPage="onPageChange(1)"
      @prevPage="onPageChange(-1)"
    />
  </div>
</template>

<style lang="postcss" scoped>

.wrapper {
  position: relative;
  line-height: normal;
  max-height: 280px;

  & .content {
    overflow: auto;
    white-space: pre;
    word-break: break-word;
    line-height: 20px;
  }

  & .controls {
    margin-bottom: -15px;
    margin-top: 10px;
  }
}
</style>
