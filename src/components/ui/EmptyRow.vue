<script setup lang="ts">
import { ROW_MARGIN_BOTTOM } from "@/util/constants";
import LoadingIcon from "webapps-common/ui/components/LoadingIcon.vue";

defineProps<{ height: number; width: number }>();
</script>

<template>
  <!--class "row" required for deep selector from knime-core-ui-->
  <tr
    class="row"
    :style="{
      height: `${height - ROW_MARGIN_BOTTOM}px`,
      marginBottom: `${ROW_MARGIN_BOTTOM}px`,
      width: `${width}px`,
    }"
  >
    <div class="sticky-flex">
      <LoadingIcon class="icon" /> <span>Loading row</span>
    </div>
  </tr>
</template>

<style lang="postcss" scoped>
tr {
  background-color: var(--knime-white);
  display: flex;
  align-items: center;
  padding-left: 30px;

  & .sticky-flex {
    position: sticky;
    left: 30px;
    align-items: center;
    gap: 10px;
    opacity: 0.4;

    & .icon {
      height: 14px;
    }
  }
}
</style>
