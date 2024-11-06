<script setup lang="ts">
import "../assets/main.css";

import Group from "./layout/Group.vue";

import type TableConfig from "@/types/TableConfig";
import type { DataItem } from "./TableUI.vue";
import type { MenuItem } from "@knime/components";
import { useCommonScrollContainerProps } from "./composables/useCommonScrollContainerProps";
import TableBodyNavigatable from "./TableBodyNavigatable.vue";

const props = defineProps<{
  scrollData: DataItem[][];
  tableConfig: TableConfig;
  currentRectId: any;
  currentBodyWidth: number;
}>();

const emit = defineEmits<{
  groupSubMenuClick: [item: MenuItem, dataGroup: any[]];
  moveSelection: [
    horizontalMove: number,
    verticalMove: number,
    expandSelection: boolean,
  ];
  clearSelection: [];
  expandSelectedCell: [];
}>();
const { closeExpandedSubMenu, containerRef, overflowStyles } =
  useCommonScrollContainerProps();
const getGroupName = (ind: number) =>
  props.tableConfig.groupByConfig?.currentGroupValues?.[ind] ?? "";

defineExpose({
  getBody: () => containerRef.value?.querySelector("tbody"),
});
</script>

<template>
  <div
    ref="containerRef"
    class="container"
    :style="overflowStyles"
    @scroll="closeExpandedSubMenu"
  >
    <slot
      name="header"
      :get-drag-handle-height="() => containerRef?.offsetHeight"
    />
    <TableBodyNavigatable
      @move-selection="
        (...args: [number, number, boolean]) => emit('moveSelection', ...args)
      "
      @clear-selection="emit('clearSelection')"
      @expand-selected-cell="emit('expandSelectedCell')"
    >
      <template #bodyContent>
        <Group
          v-for="(dataGroup, groupInd) in scrollData"
          :key="groupInd"
          :style="{ width: `${currentBodyWidth}px` }"
          :title="getGroupName(groupInd)"
          :group-sub-menu-items="tableConfig.groupSubMenuItems"
          :show="scrollData.length > 1 && dataGroup.length > 0"
          @group-sub-menu-click="
            (event: MenuItem) => emit('groupSubMenuClick', event, dataGroup)
          "
        >
          <slot
            v-if="currentRectId === groupInd"
            name="cell-selection-overlay"
            :group-ind="groupInd"
          />
          <slot
            v-for="(row, rowInd) in dataGroup"
            name="row"
            :row="(row as any).data"
            :row-ind="rowInd"
            :group-ind="groupInd"
          />
        </Group>
      </template>
    </TableBodyNavigatable>
  </div>
</template>

<style scoped lang="postcss">
.container {
  display: flex;
  flex-direction: column;
}
</style>
