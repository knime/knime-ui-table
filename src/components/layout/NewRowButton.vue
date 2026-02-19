<script setup lang="ts">
import { useTemplateRef } from "vue";

import { KdsButton } from "@knime/kds-components";

const emit = defineEmits<{
  click: [event: MouseEvent];
  "keydown-up": [event: KeyboardEvent];
}>();

const buttonRef = "button";
const button = useTemplateRef<InstanceType<typeof KdsButton>>(buttonRef);
defineExpose({
  focus: () => {
    button.value?.$el.focus();
  },
});
</script>

<template>
  <div class="sticky-container">
    <KdsButton
      :ref="buttonRef"
      label="Add"
      leading-icon="plus"
      size="small"
      :style="{ margin: '4px' }"
      @click="emit('click', $event)"
      @keydown.up.prevent.stop="emit('keydown-up', $event)"
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
