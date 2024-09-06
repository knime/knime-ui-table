<script lang="ts">
import type { PropType } from "vue";
import PageControls from "./PageControls.vue";
import { Carousel } from "@knime/components";
import type { PageConfig } from "@/types/TableConfig";
/**
 * Base table header component with table page controls on the left of the table row
 * and a slot for additional controls on the right.
 *
 * @emits nextPage
 * @emits prevPage
 */
export default {
  components: {
    PageControls,
    Carousel,
  },
  props: {
    pageConfig: {
      type: Object as PropType<PageConfig>,
      default: () => null,
    },
    hasCarousel: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  emits: ["nextPage", "prevPage"],
  methods: {
    onNextPage() {
      consola.debug("Next Page");
      this.$emit("nextPage");
    },
    onPrevPage() {
      consola.debug("Prev Page");
      this.$emit("prevPage");
    },
  },
};
</script>

<template>
  <div class="row">
    <PageControls
      :total-items="pageConfig.tableSize"
      :show-page-controls="pageConfig.showPageControls"
      :current-items="pageConfig.currentSize"
      :page-size="pageConfig.pageSize"
      :current-page="pageConfig.currentPage"
      :column-count="pageConfig.columnCount"
      :show-table-size="pageConfig.showTableSize"
      @next-page="onNextPage"
      @prev-page="onPrevPage"
    />
    <div class="controls right-controls">
      <div v-if="hasCarousel" ref="carousel-wrapper" class="carousel-wrapper">
        <Carousel>
          <div class="wrapper">
            <slot name="carousel" />
          </div>
        </Carousel>
      </div>
      <div class="wrapper">
        <slot name="rightmost-control" />
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.row {
  display: flex;
  justify-content: space-between;
  padding: 0;
  margin: 0;
  height: 40px;

  & .controls {
    padding: 0;
    font-weight: 500;
    color: var(--knime-dove-gray);

    &.right-controls {
      min-width: 0;
      display: flex;
      justify-content: flex-end;

      & .wrapper {
        flex-flow: row nowrap;
        display: inline-flex;
        align-items: center;
        text-align: left;

        & span {
          line-height: 50px;
        }
      }

      & .carousel-wrapper {
        min-width: 0;

        & .wrapper {
          padding-left: 0;
          padding-right: 0;
        }

        & :deep(.shadow-wrapper) {
          margin-right: 0;
          margin-left: 0;
        }
      }
    }
  }
}
</style>
