//  a vue composable for the capability of the the TableUI to detect the available width for all columns.
import { computed, onMounted, ref, watch, type Ref, onBeforeUnmount, nextTick } from 'vue';

const useTotalWidth = (
    root: Ref<HTMLElement>
) => {
    const totalWidth: Ref<null| number> = ref(null);

    const rootResizeObserver = new ResizeObserver((entries) => {
        const rect = entries[0].contentRect;
        totalWidth.value = rect.width;
    });

    onMounted(() => {
        rootResizeObserver.observe(root.value);
    });

    onBeforeUnmount(() => {
        rootResizeObserver.unobserve(root.value);
    });

    return totalWidth;
};

const useScrollbarWidth = (
    scrolledElement: Ref<HTMLElement>
) => {
    const currentScrollBarWidth = ref(0);

    const scrollbarWidthObserver = new ResizeObserver((entries) => {
        const totalWidth = entries[0].borderBoxSize[0].inlineSize;
        const innerWidth = entries[0].contentRect.width;
        currentScrollBarWidth.value = totalWidth - innerWidth;
    });

    onMounted(() => {
        // next tick necessary for the virtual scroller to be rendered
        nextTick(() => {
            scrollbarWidthObserver.observe(scrolledElement.value);
        });
    });

    onBeforeUnmount(() => {
        scrollbarWidthObserver.unobserve(scrolledElement.value);
    });

    return currentScrollBarWidth;
};


export default ({
    emitAvailableWidth,
    specialColumnsSizeTotal,
    refs: {
        scrolledElement,
        root
    }
} : {
    emitAvailableWidth: (availableWidth: number) => void,
    specialColumnsSizeTotal: Ref<number>,
    refs: {
        scrolledElement: Ref<HTMLElement>,
        root: Ref<HTMLElement>
    }
}) => {
    const totalWidth = useTotalWidth(root);
    const currentScrollBarWidth = useScrollbarWidth(scrolledElement);

    const currentDataWidth = computed(() => {
        if (totalWidth.value === null) {
            return null;
        }
        return totalWidth.value - currentScrollBarWidth.value - specialColumnsSizeTotal.value;
    });

    const innerWidthToBodyWidth = (availableWidth: number, useScrollbarWidth: boolean) => {
        let totalWidthWithoutScrollbar = availableWidth + specialColumnsSizeTotal.value;
        if (useScrollbarWidth && currentScrollBarWidth.value) {
            totalWidthWithoutScrollbar += currentScrollBarWidth.value;
        }
        return totalWidthWithoutScrollbar;
    };

    watch(() => currentDataWidth.value, (currentDataWidth) => {
        if (currentDataWidth !== null) {
            emitAvailableWidth(currentDataWidth);
        }
    });

    return { innerWidthToBodyWidth };
};
