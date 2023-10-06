import { ref } from "vue";
export default () => {
  const closeExpandedSubMenu = ref(() => {});

  const registerExpandedSubMenu = (callback: any) => {
    // Timeout to prevent the sub menu to be closed due to scroll event triggered by clicking a row/group
    setTimeout(() => {
      closeExpandedSubMenu.value = callback;
    }, 100);
  };

  return { closeExpandedSubMenu, registerExpandedSubMenu };
};
