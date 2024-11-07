import { computed, ref, nextTick, watchEffect } from "vue";

export const useTableReady = ({ onReady }: { onReady: () => void }) => {
  const autoSizesInitialized = ref(false);
  const availableWidthInitialized = ref(false);

  const tableIsVisible = computed(
    () => autoSizesInitialized.value && availableWidthInitialized.value,
  );

  const setAutoSizesInitialized = () => {
    autoSizesInitialized.value = true;
  };
  const setAvailableWidthInitialized = () => {
    availableWidthInitialized.value = true;
  };

  const waitUntilVisibleInDOMAndCallOnReady = async () => {
    await nextTick();
    onReady();
  };

  watchEffect(() => {
    if (tableIsVisible.value) {
      waitUntilVisibleInDOMAndCallOnReady();
    }
  });

  return {
    tableIsVisible,
    setAutoSizesInitialized,
    setAvailableWidthInitialized,
  };
};
