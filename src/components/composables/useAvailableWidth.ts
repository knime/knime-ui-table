//  a vue composable for the capability of the the TableUI to detect the available width for all columns.
import {
  type Ref,
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import throttle from "raf-throttle";

export const useTotalWidth = (root: Ref<null | HTMLElement>) => {
  const totalWidth: Ref<null | number> = ref(null);

  const rootResizeCallback = throttle((entries) => {
    const rect = entries[0].contentRect;
    totalWidth.value = rect.width;
  });
  const rootResizeObserver = new ResizeObserver(rootResizeCallback);

  onMounted(() => {
    if (root.value) {
      rootResizeObserver.observe(root.value);
    }
  });

  onBeforeUnmount(() => {
    if (root.value) {
      rootResizeObserver.unobserve(root.value);
    }
  });

  return totalWidth;
};

const useScrollbarSizes = (scrolledElement: Ref<null | HTMLElement>) => {
  const currentScrollBarWidth = ref<null | number>(null);
  const currentScrollBarHeight = ref<null | number>(null);

  const scrollbarWidthCallback = throttle((entries) => {
    const totalWidth = entries[0].borderBoxSize[0].inlineSize;
    const innerWidth = entries[0].contentRect.width;
    const totalHeight = entries[0].borderBoxSize[0].blockSize;
    const innerHeight = entries[0].contentRect.height;
    currentScrollBarHeight.value = Math.ceil(totalHeight - innerHeight);
    currentScrollBarWidth.value = Math.ceil(totalWidth - innerWidth);
  });
  const scrollbarWidthObserver = new ResizeObserver(scrollbarWidthCallback);

  onMounted(() => {
    // next tick necessary for the virtual scroller to be rendered
    nextTick(() => {
      if (scrolledElement.value) {
        scrollbarWidthObserver.observe(scrolledElement.value);
      }
    });
  });

  /**
   * If the scroller is refreshed, the scrollbar width observer needs to be updated.
   */
  watch(
    () => scrolledElement.value,
    (newEl, oldEl) => {
      if (oldEl !== null) {
        scrollbarWidthObserver.unobserve(oldEl);
      }
      if (newEl !== null) {
        scrollbarWidthObserver.observe(newEl);
      }
    },
  );

  onBeforeUnmount(() => {
    if (scrolledElement.value) {
      scrollbarWidthObserver.unobserve(scrolledElement.value);
    }
  });

  return { currentScrollBarWidth, currentScrollBarHeight };
};

export const useAvailableWidth = ({
  emitAvailableWidth,
  specialColumnsSizeTotal,
  refs: { scrolledElement },
  totalWidth,
}: {
  emitAvailableWidth: (availableWidth: number) => void;
  specialColumnsSizeTotal: Ref<number>;
  refs: {
    scrolledElement: Ref<null | HTMLElement>;
  };
  totalWidth: Ref<null | number>;
}) => {
  const { currentScrollBarWidth, currentScrollBarHeight } =
    useScrollbarSizes(scrolledElement);

  const totalWidthWithoutSpecialColumns = computed(() => {
    if (totalWidth.value === null) {
      return null;
    }
    return totalWidth.value - specialColumnsSizeTotal.value;
  });
  const currentDataWidth = computed(() => {
    if (
      totalWidthWithoutSpecialColumns.value === null ||
      currentScrollBarWidth.value === null
    ) {
      return null;
    }
    return totalWidthWithoutSpecialColumns.value - currentScrollBarWidth.value;
  });

  const innerWidthToBodyWidth = (columnsWidth: number) => {
    return columnsWidth + specialColumnsSizeTotal.value;
  };

  const fitsInsideTotalWidth = (bodyWidth: number) => {
    let width = totalWidth.value ?? 0;
    if (currentScrollBarWidth.value) {
      width -= currentScrollBarWidth.value;
    }
    return Math.floor(bodyWidth) <= width;
  };

  const allSizes = computed(() => ({
    currentDataWidth: currentDataWidth.value,
    totalWidthWithoutSpecialColumns: totalWidthWithoutSpecialColumns.value,
  }));

  watch(
    allSizes,
    (
      {
        currentDataWidth: newCurrentDataWidth,
        totalWidthWithoutSpecialColumns: newTotalWidthWithoutSpecialColumns,
      },
      {
        currentDataWidth: oldCurrentDataWidth,
        totalWidthWithoutSpecialColumns: oldTotalWidthWithoutSpecialColumns,
      },
    ) => {
      if (newCurrentDataWidth !== null) {
        const changeIsInducedByAppearingScrollbar =
          oldTotalWidthWithoutSpecialColumns ===
            newTotalWidthWithoutSpecialColumns &&
          oldCurrentDataWidth !== null &&
          oldCurrentDataWidth > newCurrentDataWidth;
        const yScrollBarExistsBecauseOfXScrollBar =
          currentScrollBarHeight.value &&
          scrolledElement.value!.scrollHeight <=
            scrolledElement.value!.clientHeight + currentScrollBarHeight.value;
        if (
          changeIsInducedByAppearingScrollbar &&
          yScrollBarExistsBecauseOfXScrollBar
        ) {
          /**
           * Updating the available width in this case can lead to an endless flicker loop:
           * 1. An x-scrollbar appears, because the content is too wide
           * 2. A y-scrollbar appears, because the x-scrollbar appeared
           * 3. The available width is updated, because the y-scrollbar appeared
           * 4. The content is scaled accordingly
           * 5. The x-scrollbar disappears, because the content is now smaller
           * 6. The y-scrollbar disappears, because the x-scrollbar disappeared
           * 7. The available width is updated, because the y-scrollbar disappeared
           * 8. The content is scaled accordingly
           * 9. Go to 1.
           *
           * To prevent this, we do not update the available width, if the y-scrollbar only exists because of the x-scrollbar.
           */
          return;
        }
        emitAvailableWidth(newCurrentDataWidth);
      }
    },
  );

  return { innerWidthToBodyWidth, fitsInsideTotalWidth };
};
