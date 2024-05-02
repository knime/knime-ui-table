<template>
  <div class="test-row" :style="style">
    <span
      v-for="[item, index] of indexedData"
      :id="JSON.stringify({ item, index })"
      class="test-cell"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useIndicesAndStylesFor } from "../../useHorizontalIndicesAndStyles";

const props = defineProps<{
  data: string[];
}>();
const { indexedData, style } = useIndicesAndStylesFor(toRef(props, "data"));
</script>
../../composables/useHorizontalIndicesAndStyles
