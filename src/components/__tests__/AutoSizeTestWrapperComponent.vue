<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import TableUIWithAutoSizeCalculation from "../TableUIWithAutoSizeCalculation.vue";

const columnSize = ref(100);
const attrs = useAttrs() as { dataConfig: { columnConfigs: any[] } };

const dataConfig = computed(() => ({
  ...attrs.dataConfig,
  columnConfigs: attrs.dataConfig.columnConfigs.map((colConfig) => ({
    ...colConfig,
    size: columnSize.value,
  })),
}));

const increaseColumnSizes = () => {
  columnSize.value += 100;
};
</script>

<template>
  <TableUIWithAutoSizeCalculation
    v-bind="attrs"
    :data-config="dataConfig"
    @auto-column-sizes-update="increaseColumnSizes"
    @update:available-width="increaseColumnSizes"
  />
</template>
