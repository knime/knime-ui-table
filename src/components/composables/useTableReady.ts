import { computed, ref } from "vue";

export default () => {
  const tableIsVisible = ref(false);
  const autoSizesWereInitiallyUpdated = ref(false);
  const availableWidthWasInitiallyUpdated = ref(false);

  const sizeUpdatesFinished = computed(
    () =>
      autoSizesWereInitiallyUpdated.value &&
      availableWidthWasInitiallyUpdated.value,
  );
  const tableIsInitiallyReady = computed(
    () => !tableIsVisible.value && sizeUpdatesFinished.value,
  );

  const setTableIsVisibleToTrue = () => {
    tableIsVisible.value = true;
  };
  const setAutoSizesWereInitiallyUpdatedToTrue = () => {
    autoSizesWereInitiallyUpdated.value = true;
  };
  const setAvailableWidthWasInitiallyUpdatedToTrue = () => {
    availableWidthWasInitiallyUpdated.value = true;
  };

  return {
    tableIsVisible,
    tableIsInitiallyReady,
    setTableIsVisibleToTrue,
    setAutoSizesWereInitiallyUpdatedToTrue,
    setAvailableWidthWasInitiallyUpdatedToTrue,
  };
};
