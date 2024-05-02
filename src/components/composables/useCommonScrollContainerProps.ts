import { provideOverflowStyles, useOverflowStyles } from "./useOverflowStyles";
import {
  injectCloseExpandedSubMenu,
  provideForCloseSubMenusOnScroll,
} from "./useCloseSubMenusOnScroll";
import { inject, provide, type InjectionKey, type Ref } from "vue";

// Exported for tests
export const injectionKey: InjectionKey<Ref<HTMLElement | null>> =
  Symbol("scrollContainerRed");

export const provideCommonScrollContainerProps = (
  containerRef: Ref<HTMLElement | null>,
  params: {
    fitsWithoutHorizontalScrollbar: Ref<boolean>;
    columnResizeActive: Ref<boolean>;
  },
) => {
  provideOverflowStyles(params);
  provideForCloseSubMenusOnScroll();
  provide(injectionKey, containerRef);
};

export const useCommonScrollContainerProps = () => {
  const closeExpandedSubMenu = injectCloseExpandedSubMenu();
  const overflowStyles = useOverflowStyles();
  const containerRef = inject(injectionKey)!;
  return {
    overflowStyles,
    closeExpandedSubMenu,
    containerRef,
  };
};
