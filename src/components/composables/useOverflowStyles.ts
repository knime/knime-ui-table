import {
  type CSSProperties,
  type InjectionKey,
  type Ref,
  computed,
  inject,
  provide,
} from "vue";

type Provided = Ref<CSSProperties>;

// Exported for tests
export const injectionKey: InjectionKey<Provided> = Symbol(
  "useOverflowStyles.ts",
);

const toHiddenOrAuto = (showScrollbar: boolean): "auto" | "hidden" =>
  showScrollbar ? "auto" : "hidden";

export const provideOverflowStyles = ({
  columnResizeActive,
  fitsWithoutHorizontalScrollbar,
}: {
  fitsWithoutHorizontalScrollbar: Ref<boolean>;
  columnResizeActive: Ref<boolean>;
}) =>
  provide(
    injectionKey,
    computed(() => ({
      overflowX: toHiddenOrAuto(
        !columnResizeActive.value && !fitsWithoutHorizontalScrollbar.value,
      ),
      overflowY: toHiddenOrAuto(!columnResizeActive.value),
    })),
  );

export const useOverflowStyles = () => inject(injectionKey)!;
