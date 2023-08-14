import { computed, ref } from "vue";

export default () => {
  const autoSizesInitialized = ref(false);
  const availableWidthInitialized = ref(false);

  const initialSizeUpdatesFinished = computed(
    () => autoSizesInitialized.value && availableWidthInitialized.value,
  );

  const setAutoSizesInitialized = () => {
    autoSizesInitialized.value = true;
  };
  const setAvailableWidthInitialized = () => {
    availableWidthInitialized.value = true;
  };

  return {
    initialSizeUpdatesFinished,
    setAutoSizesInitialized,
    setAvailableWidthInitialized,
  };
};
