<script>
import PageControls from './PageControls.vue';
import Carousel from 'webapps-common/ui/components/Carousel.vue';

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
        Carousel
    },
    props: {
        pageConfig: {
            type: Object,
            default: () => ({}),
            validate(pageConfig) {
                if (typeof pageConfig !== 'object') {
                    return false;
                }
                const requiredProperties = ['currentSize', 'tableSize', 'pageSize', 'currentPage', 'possiblePageSizes'];
                return requiredProperties.every(key => pageConfig.hasOwnProperty(key));
            }
        },
        hasCarousel: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    emits: ['nextPage', 'prevPage'],
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
  <thead>
    <tr>
      <PageControls
        :total-items="pageConfig.tableSize"
        :current-items="pageConfig.currentSize"
        :page-size="pageConfig.pageSize"
        :current-page="pageConfig.currentPage"
        :column-count="pageConfig.columnCount"
        :show-table-size="pageConfig.showTableSize"
        @next-page="onNextPage"
        @prev-page="onPrevPage"
      />
      <th class="right-controls">
        <div
          v-if="hasCarousel"
          ref="carousel-wrapper"
          class="carousel-wrapper"
        >
          <Carousel>
            <div class="wrapper">
              <slot name="carousel" />
            </div>
          </Carousel>
        </div>
        <div class="wrapper">
          <slot name="rightmost-control" />
        </div>
      </th>
    </tr>
  </thead>
</template>

<style lang="postcss" scoped>
thead {
  & tr {
    display: flex;
    justify-content: space-between;
    padding: 0;
    margin: 0;
    height: 40px;

    & th {
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
}
</style>
