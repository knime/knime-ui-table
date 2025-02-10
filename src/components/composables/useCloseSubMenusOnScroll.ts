import { type InjectionKey, inject, provide, ref } from "vue";

const setup = () => {
  const currentCallback = ref<(() => void) | null>(null);

  const registerExpandedSubMenu = (callback: () => void) => {
    // Timeout to prevent the sub menu to be closed due to scroll event triggered by clicking a row/group
    setTimeout(() => {
      currentCallback.value = () => {
        callback();
        currentCallback.value = null;
      };
    }, 100);
  };
  return {
    closeExpandedSubMenu: () => currentCallback.value?.(),
    registerExpandedSubMenu,
  };
};

type Provided = ReturnType<typeof setup>;

// Exported for tests
export const injectionKey: InjectionKey<Provided> = Symbol(
  "useCloseSubMenusOnScroll.ts",
);

export const provideForCloseSubMenusOnScroll = () =>
  provide(injectionKey, setup());

export const injectCloseExpandedSubMenu = () =>
  inject(injectionKey)!.closeExpandedSubMenu;
export const injectRegisterExpandedSubMenu = () =>
  inject(injectionKey)!.registerExpandedSubMenu;
