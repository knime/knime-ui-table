import { type ComputedRef, type Ref, onMounted, onUnmounted } from "vue";

import { getMetaOrCtrlKey } from "@knime/utils";

import type CellSelectionOverlay from "../ui/CellSelectionOverlay.vue";

import type { CellPosition } from "./useCellSelection";

export const useCellCopyPaste = ({
  focusWithin,
  isEditingCell,
  selectionOverlay,
  selectedCell,
  isEditingEnabled,
  onCopy,
  onPaste,
  onDelete,
  onCut,
}: {
  focusWithin: Ref<boolean>;
  isEditingCell: Ref<boolean>;
  selectionOverlay: Ref<
    null | typeof CellSelectionOverlay | (typeof CellSelectionOverlay)[]
  >;
  selectedCell: ComputedRef<CellPosition | undefined>;
  isEditingEnabled: ComputedRef<boolean>;
  onCopy: ({ withHeaders }: { withHeaders: boolean }) => void;
  onPaste?: () => void;
  onCut?: () => void;
  onDelete?: () => void;
}) => {
  const isHeaderCellSelected = () => selectedCell.value?.y === -1;

  const triggerCopyAnimation = () => {
    if (Array.isArray(selectionOverlay.value)) {
      selectionOverlay.value[0]?.triggerCopied();
    } else if (selectionOverlay.value) {
      selectionOverlay.value.triggerCopied();
    }
  };

  const isBodySelected = () => {
    return focusWithin.value && !isHeaderCellSelected() && !isEditingCell.value;
  };

  const primaryModifierKey = getMetaOrCtrlKey();

  const onCopySelection = ({ withHeaders }: { withHeaders: boolean }) => {
    if (!isBodySelected()) {
      return;
    }
    triggerCopyAnimation();
    onCopy({ withHeaders });
  };

  const onCutSelection = () => {
    if (isEditingEnabled.value && onCut && isBodySelected()) {
      triggerCopyAnimation();
      onCut();
    }
  };

  const onDeleteSelection = () => {
    if (isEditingEnabled.value && onDelete && isBodySelected()) {
      onDelete();
    }
  };

  const onPasteSelection = () => {
    if (isEditingEnabled.value && onPaste && isBodySelected()) {
      onPaste();
    }
  };

  const handleDefaultCopyEvent = () => {
    onCopySelection({ withHeaders: false });
  };

  const handleCopyOnKeydown = (e: KeyboardEvent) => {
    if (e[primaryModifierKey]) {
      onCopySelection({ withHeaders: true });
    }
  };

  onMounted(() => {
    window.addEventListener("copy", handleDefaultCopyEvent);
    if (onPaste) {
      window.addEventListener("paste", onPasteSelection);
    }
    if (onCut) {
      window.addEventListener("cut", onCutSelection);
    }
  });

  onUnmounted(() => {
    window.removeEventListener("copy", handleDefaultCopyEvent);
    if (onPaste) {
      window.removeEventListener("paste", onPasteSelection);
    }
    if (onCut) {
      window.removeEventListener("cut", onCutSelection);
    }
  });

  return { handleCopyOnKeydown, handleDeleteSelection: onDeleteSelection };
};
