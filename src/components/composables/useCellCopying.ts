import { onMounted, onUnmounted, ref, type Ref } from "vue";
import { getMetaOrCtrlKey } from "webapps-common/util/navigator";
import type CellSelectionOverlay from "../ui/CellSelectionOverlay.vue";

export default ({
  selectionOverlay,
  onCopy,
}: {
  selectionOverlay: Ref<
    null | typeof CellSelectionOverlay | (typeof CellSelectionOverlay)[]
  >;
  onCopy: ({ withHeaders }: { withHeaders: boolean }) => void;
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

  const onCopySelection = ({ withHeaders }: { withHeaders: boolean }) => {
    if (!focusWithin.value) {
      return;
    }
    triggerCopyAnimation();
    onCopy({ withHeaders });
  };

  const handleDefaultCopyEvent = () => {
    onCopySelection({ withHeaders: false });
  };

  const primaryModifierKey = getMetaOrCtrlKey();
  const handleCopyOnKeydown = (e: KeyboardEvent) => {
    if (e[primaryModifierKey]) {
      onCopySelection({ withHeaders: true });
    }
  };

  onMounted(() => {
    window.addEventListener("copy", handleDefaultCopyEvent);
  });

  onUnmounted(() => {
    window.removeEventListener("copy", handleDefaultCopyEvent);
  });

  return { changeFocus, handleCopyOnKeydown };
};
