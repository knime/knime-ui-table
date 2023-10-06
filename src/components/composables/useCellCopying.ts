import { onMounted, onUnmounted, ref, type Ref } from "vue";
import type CellSelectionOverlay from "../ui/CellSelectionOverlay.vue";

export default ({
  selectionOverlay,
  onCopy,
}: {
  selectionOverlay: Ref<
    null | typeof CellSelectionOverlay | (typeof CellSelectionOverlay)[]
  >;
  onCopy: () => void;
}) => {
  const focusWithin = ref(false);

  const changeFocus = (newFocus: boolean) => {
    focusWithin.value = newFocus;
  };

  const triggerCopyAnimation = () => {
    if (Array.isArray(selectionOverlay.value)) {
      selectionOverlay.value[0]?.triggerCopied();
    } else if (selectionOverlay.value) {
      selectionOverlay.value.triggerCopied();
    }
  };

  const onCopySelection = () => {
    if (!focusWithin.value) {
      return;
    }
    triggerCopyAnimation();
    onCopy();
  };

  onMounted(() => {
    window.addEventListener("copy", onCopySelection);
  });

  onUnmounted(() => {
    window.removeEventListener("copy", onCopySelection);
  });

  return { changeFocus };
};
