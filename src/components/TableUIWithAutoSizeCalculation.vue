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
import {
  MIN_COLUMN_SIZE,
  MAX_AUTO_COLUMN_SIZE,
  MIN_ROW_HEIGHT,
  MAX_ROW_HEIGHT,
} from "../util/constants";
import useTableReady from "./composables/useTableReady";
import { isEqual } from "lodash-es";
import { getCellPaddingLeft, getPropertiesFromColumns } from "@/util";
import type { PropType } from "vue";
import type DataConfig from "@/types/DataConfig";
import { type ColumnConfig } from "@/types/DataConfig";
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
    autoRowHeightOptions: {
      type: Object as PropType<{
        calculate: boolean;
        fixedHeights: Record<string | symbol, number>;
      }>,
      default: () => ({}),
    },
  },
  /* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  emits: {
    autoSizesUpdate: (
      sizes: Record<string | symbol, number>,
      height: number | null,
    ) => true,
    ready: () => true,
    "update:available-width": (newAvailableWidth: number) => true,
  },
  /* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  setup(_props, { emit }) {
    return useTableReady({ onReady: () => emit("ready") });
  },
  data() {
    return {
      currentColumnSizes: {} as Record<string | symbol, number>,
      currentHeightsByColumn: {} as Record<string | symbol, number>,
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
      Reflect.ownKeys(this.currentColumnSizes).forEach((columnId) => {
        if (!this.dataConfigIds.includes(columnId)) {
          removedColumnIds.add(columnId);
        }
      });
      return removedColumnIds;
    },
    addedColumnIds() {
      const addedColumnIds = new Set();
      this.dataConfigIds.forEach((columnId) => {
        if (!this.currentColumnSizes.hasOwnProperty(columnId)) {
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
    tableConfigForAutoSizesCalculation() {
      return { ...this.tableConfig, enableVirtualScrolling: false };
    },
    dataConfigForAutoSizesCalculation() {
      return {
        ...this.dataConfig,
        columnConfigs: this.dataConfig.columnConfigs.map(
          (columnConfig: ColumnConfig) => ({
            ...columnConfig,
            size: 0,
          }),
        ),
      };
    },
    autoColumnSizingActive() {
      return (
        this.autoColumnSizesOptions.calculateForBody ||
        this.autoColumnSizesOptions.calculateForHeader
      );
    },
    autoRowHeightSizingActive() {
      return this.autoRowHeightOptions.calculate;
    },
    autoSizingActive() {
      return this.autoColumnSizingActive || this.autoRowHeightSizingActive;
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
    currentRowHeight() {
      if (!this.autoRowHeightOptions.calculate) {
        return null;
      }
      const rowHeights = Reflect.ownKeys(this.currentHeightsByColumn).map(
        (columnId) => this.currentHeightsByColumn[columnId],
      );
      return Math.min(Math.max(...rowHeights), MAX_ROW_HEIGHT);
    },
  },
  watch: {
    autoColumnSizesOptions: {
      handler(oldVal, newVal) {
        if (!isEqual(newVal, oldVal)) {
          this.triggerCalculationOfAutoSizes();
        }
      },
      deep: true,
    },
    autoRowHeightOptions: {
      handler(oldVal, newVal) {
        if (!isEqual(newVal, oldVal)) {
          this.triggerCalculationOfAutoSizes();
        }
      },
      deep: true,
    },
    dataConfigIds(newIds, oldIds) {
      if (
        newIds.length !== oldIds.length ||
        !newIds.every((el: any, index: number) => el === oldIds[index])
      ) {
        this.triggerCalculationOfAutoSizes();
      }
    },
  },
  mounted() {
    this.triggerCalculationOfAutoSizes();
  },
  methods: {
    triggerCalculationOfAutoSizes() {
      if (!this.autoSizingActive) {
        this.currentColumnSizes = {};
        this.currentHeightsByColumn = {};
        this.emitNewAutoSizes();
      } else if (this.columnsWereOnlyRemoved) {
        Reflect.ownKeys(this.currentColumnSizes).forEach((columnId) => {
          if (this.removedColumnIds.has(columnId)) {
            delete this.currentColumnSizes[columnId];
            delete this.currentHeightsByColumn[columnId];
          }
        });
        this.$emit(
          "autoSizesUpdate",
          this.currentColumnSizes,
          this.currentRowHeight,
        );
      } else {
        this.calculateSizes = true;
      }
    },
    async calculateAutoSizes() {
      // Wait for the fonts to be loaded before calculating the column sizes based on the rendered table
      await Promise.all([
        document.fonts.load("400 1em Roboto"),
        document.fonts.load("700 1em Roboto"),
      ]);
      this.initializeCurrentColumnSizes();
      this.initializeCurrentRowHeights();
      const { calculateForBody, calculateForHeader } =
        this.autoColumnSizesOptions;
      const { calculate } = this.autoRowHeightOptions;
      if (calculateForBody || calculate) {
        const { autoColumnSizes, autoRowHeights } =
          this.calculateAutoSizesBody();
        if (calculateForBody) {
          this.calculateAutoColumnSizesBody(autoColumnSizes);
        }
        if (calculate) {
          this.calculateAutoRowHeights(autoRowHeights);
        }
      }
      if (calculateForHeader) {
        this.calculateAutoColumnSizesHeader();
      }
      this.enforceMaxColSize();
      this.calculateSizes = false;
      this.emitNewAutoSizes();
    },
    initializeCurrentColumnSizes() {
      this.currentColumnSizes = this.dataConfigIds.reduce(
        (columnSizes, columnId) => ({
          ...columnSizes,
          [columnId]: MIN_COLUMN_SIZE,
        }),
        {},
      );
    },
    initializeCurrentRowHeights() {
      this.currentHeightsByColumn = this.dataConfigIds.reduce(
        (rowHeights, columnId) => ({
          ...rowHeights,
          [columnId]: MIN_ROW_HEIGHT,
        }),
        {},
      );
    },
    calculateAutoColumnSizesBody(
      autoColumnSizes: Record<string | symbol, number>[] = [],
    ) {
      const { fixedSizes } = this.autoColumnSizesOptions;
      Reflect.ownKeys(fixedSizes).forEach((columnId) => {
        if (this.currentColumnSizes.hasOwnProperty(columnId)) {
          this.currentColumnSizes[columnId] = Math.max(
            MIN_COLUMN_SIZE,
            fixedSizes[columnId] + this.columnPaddingsLeft[columnId],
          );
        }
      });

      autoColumnSizes.forEach((autoSizesByColumn) => {
        this.currentColumnSizes = Reflect.ownKeys(autoSizesByColumn).reduce(
          (newSizes, columnId) => ({
            ...newSizes,
            [columnId]: Math.max(
              this.currentColumnSizes[columnId],
              autoSizesByColumn[columnId],
            ),
          }),
          this.currentColumnSizes,
        );
      });
    },
    calculateAutoRowHeights(
      autoRowHeights: Record<string | symbol, number>[] = [],
    ) {
      const { fixedHeights } = this.autoRowHeightOptions;
      Reflect.ownKeys(fixedHeights).forEach((columnId) => {
        if (this.currentHeightsByColumn.hasOwnProperty(columnId)) {
          this.currentHeightsByColumn[columnId] = Math.max(
            MIN_ROW_HEIGHT,
            fixedHeights[columnId], // + TODO: margin top/bottom,
          );
        }
      });
      autoRowHeights.forEach((autoRowHeightsByColumn) => {
        this.currentHeightsByColumn = Reflect.ownKeys(
          autoRowHeightsByColumn,
        ).reduce(
          (newHeights, columnId) => ({
            ...newHeights,
            [columnId]: Math.max(
              this.currentHeightsByColumn[columnId],
              autoRowHeightsByColumn[columnId],
            ),
          }),
          {},
        );
      });
    },

    calculateAutoSizesBody() {
      const rowComponents = (
        this.$refs.tableUIForAutoSize as any
      ).getRowComponents();

      const { fixedSizes } = this.autoColumnSizesOptions;

      const autoColumnSizes: Record<string | symbol, number>[] = [];
      const autoRowHeights: Record<string | symbol, number>[] = [];

      rowComponents.forEach((rowComponent: any) => {
        const sizesByColumn: Record<string | symbol, number> = {};
        const heightsByColumn: Record<string | symbol, number> = {};
        const cellComponents = rowComponent.getCellComponents();
        this.dataConfigIds.forEach((columnId, columnIndex) => {
          if (!fixedSizes.hasOwnProperty(columnId)) {
            const { width, height } =
              cellComponents[columnIndex].getCellContentDimensions();
            sizesByColumn[columnId] = width;
            heightsByColumn[columnId] = height;
          }
        });
        autoColumnSizes.push(sizesByColumn);
        autoRowHeights.push(heightsByColumn);
      });
      return { autoColumnSizes, autoRowHeights };
    },
    calculateAutoColumnSizesHeader() {
      const headerCellSizes = (this.$refs.tableUIForAutoSize as any)
        .getHeaderComponent()
        .getHeaderCellWidths();
      this.dataConfigIds.forEach((columnId, columnIndex) => {
        const headerWidth = headerCellSizes[columnIndex];
        if (this.currentColumnSizes[columnId] < headerWidth) {
          this.currentColumnSizes[columnId] = headerWidth;
        }
      });
    },
    enforceMaxColSize() {
      this.currentColumnSizes = Reflect.ownKeys(this.currentColumnSizes).reduce(
        (enforcedColSizes, columnId) => ({
          ...enforcedColSizes,
          [columnId]: Math.min(
            this.currentColumnSizes[columnId],
            MAX_AUTO_COLUMN_SIZE,
          ),
        }),
        {},
      );
    },
    emitNewAutoSizes() {
      this.$emit(
        "autoSizesUpdate",
        this.currentColumnSizes,
        this.currentRowHeight,
      );
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
    :data-config="dataConfigForAutoSizesCalculation"
    :table-config="tableConfigForAutoSizesCalculation"
    @vue:mounted="calculateAutoSizes"
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
