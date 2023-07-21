<script>
/**
 * This component contains the ability to size the columns in the tableUI according to the width of its content by
 * enforcing a maximum size of MAX_AUTO_COLUMN_SIZE. It takes the same props as the TableUI.vue and one additonal prop,
 * the options for the calculation.
 * To trigger the calculation of the auto sizes, the corresponding trigger method can be called from the parent. The
 * method is automatically called from within this component when:
 *  - the component is mounted
 *  - one of the options to calculate the automatic sizes for the body or the header changes
 *  - when columns were removed, added, or replaced
 */

import TableUI from './TableUI.vue';
import { MIN_COLUMN_SIZE, MAX_AUTO_COLUMN_SIZE } from '../util/constants';

const DEFAULT_NUM_ROWS = 10;

export default {
    components: { TableUI },
    inheritAttrs: false,
    props: {
        data: { type: Array, default: () => [] },
        currentSelection: { type: Array, default: () => [] },
        dataConfig: { type: Object, default: () => ({}) },
        tableConfig: { type: Object, default: () => ({}) },
        /** This object contains all the options necessary to calculate the sizes based on the
         * content. In case only one of calculateForBody/calculateForHeader is true, the emmited object contains auto
         * sizes according to body/header. In case both are true, the maximum of both values is used. For fixedSizes no
         * body sizes are calculated.
         * {
         *      calculateForBody: boolean,
         *      calculateForHeader: boolean,
         *      fixedSizes: Object of id => size
         * }
         */
        autoColumnSizesOptions: { type: Object, default: () => ({}) }
    },
    emits: [
        'autoColumnSizesUpdate'
    ],
    data() {
        return {
            autoColumnSizesCalculationFinished: false,
            currentSizes: {},
            calculateSizes: false
        };
    },
    computed: {
        mountTableUIForAutoSizeCalculation() {
            return this.data !== null && this.calculateSizes;
        },
        dataConfigIds() {
            return this.dataConfig.columnConfigs.map(columnConfig => columnConfig.id);
        },
        removedColumnIds() {
            const removedColumnIds = new Set();
            Reflect.ownKeys(this.currentSizes).forEach((columnId) => {
                if (!this.dataConfigIds.includes(columnId)) {
                    removedColumnIds.add(columnId);
                }
            });
            return removedColumnIds;
        },
        addedColumnIds() {
            const addedColumnIds = new Set();
            this.dataConfigIds.forEach((columnId) => {
                if (!this.currentSizes.hasOwnProperty(columnId)) {
                    addedColumnIds.add(columnId);
                }
            });
            return addedColumnIds;
        },
        columnsWereOnlyRemoved() {
            return this.addedColumnIds.size === 0 && this.removedColumnIds.size > 0;
        },
        paginatedDataForAutoColumnSizesCalculation() {
            return [this.data.flat().slice(0, DEFAULT_NUM_ROWS)];
        },
        tableConfigForAutoColumnSizesCalculation() {
            return { ...this.tableConfig, enableVirtualScrolling: false };
        },
        dataConfigForAutoColumnSizesCalculation() {
            return { ...this.dataConfig,
                columnConfigs: this.dataConfig.columnConfigs.map((columnConfig) => ({ ...columnConfig, size: 0 })) };
        },
        autoSizingActive() {
            return this.autoColumnSizesOptions.calculateForBody || this.autoColumnSizesOptions.calculateForHeader;
        }
    },
    watch: {
        'autoColumnSizesOptions.calculateForBody'() {
            this.triggerCalculationOfAutoColumnSizes();
        },
        'autoColumnSizesOptions.calculateForHeader'() {
            this.triggerCalculationOfAutoColumnSizes();
        },
        dataConfigIds(newIds, oldIds) {
            if (newIds.length !== oldIds.length || !newIds.every((el, index) => el === oldIds[index])) {
                this.triggerCalculationOfAutoColumnSizes();
            }
        }
    },
    mounted() {
        this.triggerCalculationOfAutoColumnSizes();
    },
    methods: {
        triggerCalculationOfAutoColumnSizes() {
            if (!this.autoSizingActive) {
                this.autoColumnSizesCalculationFinished = true;
                this.currentSizes = {};
                this.$emit('autoColumnSizesUpdate', this.currentSizes);
            } else if (this.columnsWereOnlyRemoved) {
                Reflect.ownKeys(this.currentSizes).forEach(columnId => {
                    if (this.removedColumnIds.has(columnId)) {
                        delete this.currentSizes[columnId];
                    }
                });
                this.$emit('autoColumnSizesUpdate', this.currentSizes);
            } else {
                this.calculateSizes = true;
            }
        },
        async calculateAutoColumnSizes() {
            // Wait for the fonts to be loaded before calculating the column sizes based on the rendered table
            await Promise.all([document.fonts.load('400 1em Roboto'), document.fonts.load('700 1em Roboto')]);
            this.initializeCurrentSizes();
            const { calculateForBody, calculateForHeader } = this.autoColumnSizesOptions;
            if (calculateForBody) {
                this.calculateAutoColumnSizesBody();
            }
            if (calculateForHeader) {
                this.calculateAutoColumnSizesHeader();
            }
            this.enforceMaxColSize();
            this.calculateSizes = false;
            this.autoColumnSizesCalculationFinished = true;
            this.$emit('autoColumnSizesUpdate', this.currentSizes);
        },
        initializeCurrentSizes() {
            this.currentSizes = this.dataConfigIds.reduce((columnSizes, columnId) => (
                { ...columnSizes, [columnId]: MIN_COLUMN_SIZE }
            ), {});
        },
        calculateAutoColumnSizesBody() {
            const rowComponents = this.$refs.tableUIForAutoSize.getRowComponents();

            const { fixedSizes } = this.autoColumnSizesOptions;
            Reflect.ownKeys(fixedSizes).forEach((columnId) => {
                if (this.currentSizes.hasOwnProperty(columnId)) {
                    this.currentSizes[columnId] =
                        Math.max(MIN_COLUMN_SIZE, fixedSizes[columnId]);
                }
            });

            rowComponents.forEach((rowComponent) => {
                const cellComponents = rowComponent.getCellComponents();
                this.dataConfigIds.forEach((columnId, columnIndex) => {
                    if (!fixedSizes.hasOwnProperty(columnId)) {
                        const width = cellComponents[columnIndex].getCellContentWidth();
                        if (this.currentSizes[columnId] < width) {
                            this.currentSizes[columnId] = width;
                        }
                    }
                });
            });
        },
        calculateAutoColumnSizesHeader() {
            const headerCellSizes = this.$refs.tableUIForAutoSize.getHeaderComponent().getHeaderCellWidths();
            this.dataConfigIds.forEach((columnId, columnIndex) => {
                const headerWidth = headerCellSizes[columnIndex];
                if (this.currentSizes[columnId] < headerWidth) {
                    this.currentSizes[columnId] = headerWidth;
                }
            });
        },
        enforceMaxColSize() {
            this.currentSizes = Reflect.ownKeys(this.currentSizes).reduce((enforcedColSizes, columnId) => (
                { ...enforcedColSizes,
                    [columnId]: Math.min(this.currentSizes[columnId], MAX_AUTO_COLUMN_SIZE) }), {});
        },
        getTableUIElement() {
            return this.$refs.tableUI.$el;
        },
        refreshScroller() {
            this.$refs.tableUI?.refreshScroller();
        }
    }
};
</script>

<template>
  <TableUI
    ref="tableUI"
    :style="{ visibility: !autoSizingActive || autoColumnSizesCalculationFinished ? 'visible': 'hidden'}"
    v-bind="$attrs"
    :data="data"
    :current-selection="currentSelection"
    :data-config="dataConfig"
    :table-config="tableConfig"
  >
    <template
      v-for="(_, slot) of $slots"
      #[slot]="scope"
    >
      <slot
        :name="slot"
        v-bind="scope"
      />
    </template>
  </TableUI>
  <TableUI
    v-if="mountTableUIForAutoSizeCalculation"
    ref="tableUIForAutoSize"
    class="table-column-size-calculation"
    :data="paginatedDataForAutoColumnSizesCalculation"
    :current-selection="currentSelection"
    :data-config="dataConfigForAutoColumnSizesCalculation"
    :table-config="tableConfigForAutoColumnSizesCalculation"
    @vue:mounted="calculateAutoColumnSizes"
  >
    <template
      v-for="(_, slot) of $slots"
      #[slot]="scope"
    >
      <slot
        :name="slot"
        v-bind="scope"
      />
    </template>
  </TableUI>
</template>

<style scoped>
.table-column-size-calculation {
    position: absolute;
    left: -9999px;
    top: -9999px;
    visibility: hidden;
}
</style>
