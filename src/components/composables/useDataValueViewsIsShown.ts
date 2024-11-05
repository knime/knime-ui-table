import { TableConfig } from "lib/main";
import { computed, inject, InjectionKey, provide, type Ref } from "vue";

/**
 * Exported for testing purposes
 */
export const injectionKey: InjectionKey<Ref<boolean>> = Symbol(
  "dataValueViewsIsShown",
);

export default () => inject(injectionKey);

export const provideDataValueViewsIsShown = (tableConfig: Ref<TableConfig>) =>
  provide(
    injectionKey,
    computed(() => Boolean(tableConfig.value.dataValueViewIsShown)),
  );
