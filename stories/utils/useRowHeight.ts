import { computed, reactive, ref } from "vue";

export default (
  autoSizeRowsToRowWithMaxHeight: boolean,
  fixedRowHeights: Record<string | symbol, number>,
  dynamicRowHeight: boolean,
  rowHeight: number | null,
) => {
  const autoRowHeight = ref(0);

  const autoRowHeightOptions = reactive({
    calculate: autoSizeRowsToRowWithMaxHeight,
    fixedHeights: fixedRowHeights || {},
  });

  const currentRowHeight = computed(() => {
    if (dynamicRowHeight) {
      return "dynamic";
    }
    if (autoSizeRowsToRowWithMaxHeight) {
      return autoRowHeight.value;
    }
    return rowHeight;
  });

  const onAutoRowHeightUpdate = (newAutoRowHeight) => {
    autoRowHeight.value = newAutoRowHeight;
  };

  return {
    currentRowHeight,
    autoRowHeightOptions,
    onAutoRowHeightUpdate,
  };
};
