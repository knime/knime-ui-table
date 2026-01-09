<script setup lang="ts">
import { KdsButton } from "@knime/kds-components";

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <div class="sticky-container">
    <KdsButton
      label="New row"
      leading-icon="plus"
      size="small"
      :style="{ margin: '4px' }"
      @click="emit('click', $event)"
    />
  </div>
</template>

<style scoped lang="postcss">
.sticky-container {
  position: sticky;
  left: 0;
  width: fit-content;
}
</style>
