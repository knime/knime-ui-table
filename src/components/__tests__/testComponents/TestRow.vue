<script setup lang="ts">
import { toRef } from "vue";

import { useIndicesAndStylesFor } from "../../composables/useHorizontalIndicesAndStyles";

const props = defineProps<{
  data: string[];
}>();
const { indexedData, style } = useIndicesAndStylesFor(toRef(props, "data"));
</script>

<template>
  <div class="test-row" :style="style">
    <span
      v-for="[item, index] of indexedData"
      :id="JSON.stringify({ item, index })"
      :key="index"
      class="test-cell"
    />
  </div>
</template>
