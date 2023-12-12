<script lang="ts">
/**
 * This component contains the ability to size the columns in the tableUI according to the width of its content by
 * enforcing a maximum size of MAX_AUTO_COLUMN_SIZE. It takes the same props as the TableUI.vue and one additional prop,
 * the options for the calculation.
 * To trigger the calculation of the auto sizes, the corresponding trigger method can be called from the parent. The
 * method is automatically called from within this component when:
 *  - the component is mounted
 *  - one property of the autoColumnSizesOptions changes
 *  - when columns were removed, added, or replaced
 */

import TableUI from "./TableUI.vue";
import { MIN_COLUMN_SIZE, MAX_AUTO_COLUMN_SIZE } from "../util/constants";
import useTableReady from "./composables/useTableReady";
import { isEqual } from "lodash";
import { getCellPaddingLeft, getPropertiesFromColumns } from "@/util";
import type { PropType } from "vue";
import type DataConfig from "@/types/DataConfig";
import type TableConfig from "@/types/TableConfig";

/**
 * In a lot of cases, the row ids are Row0, Row1, ....
 * With 11 rows taken into account, we respect "Row10".
 */
const DEFAULT_NUM_ROWS = 11;

export default {
  components: { TableUI },
  inheritAttrs: false,
  props: {
    data: { type: Array as PropType<Array<Array<any>>>, default: () => [] },
    currentSelection: {
      type: Array as PropType<Array<Array<boolean>>>,
      default: () => [],
    },
    dataConfig: {
      type: Object as PropType<DataConfig>,
      default: () => ({}),
    },
    tableConfig: {
      type: Object as PropType<TableConfig>,
      default: () => ({}),
    },
    /** This object contains all the options necessary to calculate the sizes based on the
     * content. In case only one of calculateForBody/calculateForHeader is true, the emitted object contains auto
     * sizes according to body/header. In case both are true, the maximum of both values is used. For fixedSizes only
     * header sizes are calculated and the body sizes will be increased by the padding that the column will have based
     * on the first row.
     */
    autoColumnSizesOptions: {
      type: Object as PropType<{
        calculateForBody: boolean;
        calculateForHeader: boolean;
        fixedSizes: Record<string | symbol, number>;
      }>,
      default: () => ({}),
    },
  },
  /* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  emits: {
    autoColumnSizesUpdate: (sizes: Record<string | symbol, number>) => true,
    ready: () => true,
    "update:available-width": (newAvailableWidth: number) => true,
  },
  /* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  setup(_props, { emit }) {
    return useTableReady({ onReady: () => emit("ready") });
  },
  data() {
    return {
      currentSizes: {} as Record<string | symbol, number>,
      calculateSizes: false,
    };
  },
  computed: {
    mountTableUIForAutoSizeCalculation() {
      return this.data !== null && this.calculateSizes;
    },
    dataConfigIds() {
      return getPropertiesFromColumns(this.dataConfig.columnConfigs, "id");
    },
    dataConfigKeys() {
      return getPropertiesFromColumns(this.dataConfig.columnConfigs, "key");
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
      return {
        ...this.dataConfig,
        columnConfigs: this.dataConfig.columnConfigs.map(
          (columnConfig: any) => ({
            ...columnConfig,
            size: 0,
          }),
        ),
      };
    },
    autoSizingActive() {
      return (
        this.autoColumnSizesOptions.calculateForBody ||
        this.autoColumnSizesOptions.calculateForHeader
      );
    },
    columnPaddingsLeft() {
      const firstRowData: any =
        this.paginatedDataForAutoColumnSizesCalculation[0][0];
      return this.dataConfigKeys.reduce(
        (columnPaddingsLeft, columnKey, columnIndex) => {
          const columnId = this.dataConfigIds[columnIndex];
          const columnValue = firstRowData[columnKey];
          columnPaddingsLeft[columnId] = getCellPaddingLeft(columnValue);
          return columnPaddingsLeft;
        },
        {} as Record<string | symbol | number, number>,
      );
    },
  },
  watch: {
    autoColumnSizesOptions: {
      handler(oldVal, newVal) {
        if (!isEqual(newVal, oldVal)) {
          this.triggerCalculationOfAutoColumnSizes();
        }
      },
      deep: true,
    },
    dataConfigIds(newIds, oldIds) {
      if (
        newIds.length !== oldIds.length ||
        !newIds.every((el: any, index: number) => el === oldIds[index])
      ) {
        this.triggerCalculationOfAutoColumnSizes();
      }
    },
  },
  mounted() {
    this.triggerCalculationOfAutoColumnSizes();
  },
  methods: {
    triggerCalculationOfAutoColumnSizes() {
      if (!this.autoSizingActive) {
        this.currentSizes = {};
        this.emitNewAutoSizes();
      } else if (this.columnsWereOnlyRemoved) {
        Reflect.ownKeys(this.currentSizes).forEach((columnId) => {
          if (this.removedColumnIds.has(columnId)) {
            delete this.currentSizes[columnId];
          }
        });
        this.$emit("autoColumnSizesUpdate", this.currentSizes);
      } else {
        this.calculateSizes = true;
      }
    },
    async calculateAutoColumnSizes() {
      // Wait for the fonts to be loaded before calculating the column sizes based on the rendered table
      await Promise.all([
        document.fonts.load("400 1em Roboto"),
        document.fonts.load("700 1em Roboto"),
      ]);
      this.initializeCurrentSizes();
      const { calculateForBody, calculateForHeader } =
        this.autoColumnSizesOptions;
      if (calculateForBody) {
        this.calculateAutoColumnSizesBody();
      }
      if (calculateForHeader) {
        this.calculateAutoColumnSizesHeader();
      }
      this.enforceMaxColSize();
      this.calculateSizes = false;
      this.emitNewAutoSizes();
    },
    initializeCurrentSizes() {
      this.currentSizes = this.dataConfigIds.reduce(
        (columnSizes, columnId) => ({
          ...columnSizes,
          [columnId]: MIN_COLUMN_SIZE,
        }),
        {},
      );
    },
    calculateAutoColumnSizesBody() {
      const rowComponents = (
        this.$refs.tableUIForAutoSize as any
      ).getRowComponents();

      const { fixedSizes } = this.autoColumnSizesOptions;
      Reflect.ownKeys(fixedSizes).forEach((columnId) => {
        if (this.currentSizes.hasOwnProperty(columnId)) {
          this.currentSizes[columnId] = Math.max(
            MIN_COLUMN_SIZE,
            fixedSizes[columnId] + this.columnPaddingsLeft[columnId],
          );
        }
      });

      rowComponents.forEach((rowComponent: any) => {
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
      const headerCellSizes = (this.$refs.tableUIForAutoSize as any)
        .getHeaderComponent()
        .getHeaderCellWidths();
      this.dataConfigIds.forEach((columnId, columnIndex) => {
        const headerWidth = headerCellSizes[columnIndex];
        if (this.currentSizes[columnId] < headerWidth) {
          this.currentSizes[columnId] = headerWidth;
        }
      });
    },
    enforceMaxColSize() {
      this.currentSizes = Reflect.ownKeys(this.currentSizes).reduce(
        (enforcedColSizes, columnId) => ({
          ...enforcedColSizes,
          [columnId]: Math.min(
            this.currentSizes[columnId],
            MAX_AUTO_COLUMN_SIZE,
          ),
        }),
        {},
      );
    },
    emitNewAutoSizes() {
      this.$emit("autoColumnSizesUpdate", this.currentSizes);
      this.setAutoSizesInitialized();
    },
    onUpdateAvailableWidth(newAvailableWidth: number) {
      this.$emit("update:available-width", newAvailableWidth);
      this.setAvailableWidthInitialized();
    },
    getTableUIElement() {
      return (this.$refs.tableUI as any).$el;
    },
    refreshScroller() {
      (this.$refs.tableUI as any)?.refreshScroller();
    },
    clearCellSelection() {
      (this.$refs.tableUI as any)?.clearCellSelection();
    },
  },
};
</script>

<template>
  <TableUI
    ref="tableUI"
    :style="{
      visibility: tableIsVisible ? 'visible' : 'hidden',
    }"
    v-bind="$attrs"
    :data="data"
    :current-selection="currentSelection"
    :data-config="dataConfig"
    :table-config="tableConfig"
    @update:available-width="onUpdateAvailableWidth"
  >
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
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
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
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
