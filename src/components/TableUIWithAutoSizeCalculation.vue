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

type SizeByColumn = Record<string | symbol, number>;

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
        fixedSizes: SizeByColumn;
      }>,
      default: () => ({}),
    },
    autoRowHeightOptions: {
      type: Object as PropType<{
        calculate: boolean;
        fixedHeights: SizeByColumn;
      }>,
      default: () => ({}),
    },
  },
  /* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  emits: {
    autoColumnSizesUpdate: (sizes: SizeByColumn) => true,
    autoRowHeightUpdate: (height: number) => true,
    ready: () => true,
    "update:available-width": (newAvailableWidth: number) => true,
  },
  /* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars  */
  setup(_props, { emit }) {
    return useTableReady({ onReady: () => emit("ready") });
  },
  data() {
    return {
      currentColumnSizes: {} as SizeByColumn,
      currentHeightsByColumn: {} as SizeByColumn,
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
    autoSizingOnBodyActive() {
      return (
        this.autoColumnSizesOptions.calculateForBody ||
        this.autoRowHeightSizingActive
      );
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
    "dataConfig.rowConfig.compactMode": {
      handler() {
        if (this.autoRowHeightOptions.calculate) {
          this.triggerCalculationOfAutoSizes();
        }
      },
    },
  },
  mounted() {
    this.triggerCalculationOfAutoSizes();
  },
  methods: {
    emitNewAutoColumnSizes() {
      this.$emit("autoColumnSizesUpdate", this.currentColumnSizes);
    },
    emitNewAutoRowHeight() {
      this.$emit("autoRowHeightUpdate", this.currentRowHeight);
    },
    emitNewAutoSizes() {
      if (this.autoColumnSizingActive) {
        this.emitNewAutoColumnSizes();
      }
      if (this.autoRowHeightSizingActive) {
        this.emitNewAutoRowHeight();
      }
      this.setAutoSizesInitialized();
    },
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
        this.emitNewAutoSizes();
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

      if (this.autoColumnSizingActive) {
        this.currentColumnSizes =
          this.initializeSizesWithMinSize(MIN_COLUMN_SIZE);
      }
      if (this.autoRowHeightSizingActive) {
        this.currentHeightsByColumn =
          this.initializeSizesWithMinSize(MIN_ROW_HEIGHT);
      }

      const { calculateForBody, calculateForHeader, fixedSizes } =
        this.autoColumnSizesOptions;

      if (this.autoSizingOnBodyActive) {
        const { autoColumnSizes, autoRowHeights } =
          this.calculateAutoSizesBody();
        if (calculateForBody) {
          this.addFixedAndAutoSizes({
            sizesToUpdate: this.currentColumnSizes,
            autoSizesByRow: autoColumnSizes,
            fixedSizes,
            minSize: MIN_COLUMN_SIZE,
            paddings: this.columnPaddingsLeft,
          });
        }
        if (this.autoRowHeightSizingActive) {
          this.addFixedAndAutoSizes({
            sizesToUpdate: this.currentHeightsByColumn,
            autoSizesByRow: autoRowHeights,
            fixedSizes: this.autoRowHeightOptions.fixedHeights,
            minSize: MIN_ROW_HEIGHT,
          });
        }
      }
      if (calculateForHeader) {
        this.calculateAutoColumnSizesHeader();
      }

      if (calculateForBody || calculateForHeader) {
        this.enforceMaxColSize();
      }
      this.calculateSizes = false;
      this.emitNewAutoSizes();
    },
    initializeSizesWithMinSize(minSize: number) {
      return this.dataConfigIds.reduce(
        (sizes, columnId) => ({
          ...sizes,
          [columnId]: minSize,
        }),
        {},
      );
    },
    addFixedAndAutoSizes({
      sizesToUpdate,
      autoSizesByRow,
      fixedSizes,
      minSize,
      paddings = null,
    }: {
      sizesToUpdate: SizeByColumn;
      autoSizesByRow: SizeByColumn[];
      fixedSizes: SizeByColumn;
      minSize: number;
      paddings?: SizeByColumn | null;
    }) {
      Reflect.ownKeys(fixedSizes).forEach((columnId) => {
        if (sizesToUpdate.hasOwnProperty(columnId)) {
          sizesToUpdate[columnId] = Math.max(
            minSize,
            fixedSizes[columnId] + (paddings?.[columnId] || 0),
          );
        }
      });

      autoSizesByRow.forEach((autoSizes) => {
        Reflect.ownKeys(autoSizes).forEach((columnId) => {
          sizesToUpdate[columnId] = Math.max(
            sizesToUpdate[columnId],
            autoSizes[columnId],
          );
        });
      });
    },

    calculateAutoSizesBody() {
      const rowComponents = (
        this.$refs.tableUIForAutoSize as any
      ).getRowComponents();

      const { fixedSizes } = this.autoColumnSizesOptions;

      const autoColumnSizes: SizeByColumn[] = [];
      const autoRowHeights: SizeByColumn[] = [];

      rowComponents.forEach((rowComponent: any) => {
        const sizesByColumn: SizeByColumn = {};
        const heightsByColumn: SizeByColumn = {};
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
