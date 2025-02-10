import {
  type CSSProperties,
  type InjectionKey,
  type MaybeRef,
  type Ref,
  computed,
  inject,
  provide,
} from "vue";

import type { IndexStartEnd } from "@knime/vue-headless-virtual-scroller";

export interface Payload {
  horizontal: Ref<IndexStartEnd>;
  horizontalStyles: Ref<CSSProperties>;
}

const injectionKey: InjectionKey<Payload> = Symbol(
  "useHorizontalIndicesAndStyles.ts",
);

export const provideForHorizontalVirtualScrolling = (payload: Payload) =>
  provide(injectionKey, payload);

export const useIndicesAndStylesFor = <T>(
  data: Ref<T[]>,
): {
  indexedData: Ref<[T, number][]>;
  style: MaybeRef<CSSProperties>;
} => {
  const providedForVirtualScrolling = inject(injectionKey, null);
  if (providedForVirtualScrolling) {
    return {
      indexedData: computed(() =>
        providedForVirtualScrolling.horizontal.value
          .toArray()
          .map((index) => [data.value[index], index]),
      ),
      style: providedForVirtualScrolling.horizontalStyles,
    };
  }
  return {
    indexedData: computed(() =>
      data.value.map((value, index) => [value, index]),
    ),
    style: {},
  };
};
