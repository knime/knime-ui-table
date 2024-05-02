<script setup lang="ts">
import "./main.css";

import Group from "./layout/Group.vue";

import type TableConfig from "@/types/TableConfig";
import type { DataItem } from "./TableUI.vue";
import type { MenuItem } from "webapps-common/ui/components/MenuItems.vue";
import { useCommonScrollContainerProps } from "./composables/useCommonScrollContainerProps";

const props = defineProps<{
  scrollData: DataItem[][];
  tableConfig: TableConfig;
  currentRectId: any;
  currentBodyWidth: number;
}>();

const emit = defineEmits<{
  groupSubMenuClick: [item: MenuItem, dataGroup: any[]];
}>();
const { closeExpandedSubMenu, containerRef, overflowStyles } =
  useCommonScrollContainerProps();
const getGroupName = (ind: number) =>
  props.tableConfig.groupByConfig?.currentGroupValues?.[ind] ?? "";
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
  </div>
</template>

<style scoped lang="postcss">
.container {
  display: flex;
  flex-direction: column;
}
</style>
