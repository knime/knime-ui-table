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

const useScrollbarWidth = (scrolledElement: Ref<null | HTMLElement>) => {
  const currentScrollBarWidth: Ref<null | number> = ref(null);

  const scrollbarWidthCallback = throttle((entries) => {
    const totalWidth = entries[0].borderBoxSize[0].inlineSize;
    const innerWidth = entries[0].contentRect.width;
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

  return currentScrollBarWidth;
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
  const currentScrollBarWidth = useScrollbarWidth(scrolledElement);

  const currentDataWidth = computed(() => {
    if (totalWidth.value === null || currentScrollBarWidth.value === null) {
      return null;
    }
    return (
      totalWidth.value -
      currentScrollBarWidth.value -
      specialColumnsSizeTotal.value
    );
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

  watch(
    () => currentDataWidth.value,
    (currentDataWidth) => {
      if (currentDataWidth !== null) {
        emitAvailableWidth(currentDataWidth);
      }
    },
  );

  return { innerWidthToBodyWidth, fitsInsideTotalWidth };
};
