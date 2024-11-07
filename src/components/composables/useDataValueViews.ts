import { TableConfig } from "lib/main";
import { computed, inject, InjectionKey, provide, type Ref } from "vue";

/**
 * Exported for testing purposes
 */
export const injectionKey: InjectionKey<{
  isShown: Ref<boolean>;
  close: () => void;
}> = Symbol("dataValueViewsIsShown");

export const useDataValueViews = () => inject(injectionKey)!;

export const provideDataValueViewsIsShown = (
  tableConfig: Ref<TableConfig>,
  closeDataValueView: () => void,
) =>
  provide(injectionKey, {
    isShown: computed(() => Boolean(tableConfig.value.dataValueViewIsShown)),
    close: closeDataValueView,
  });
