import { getMetaOrCtrlKey } from "@knime/utils";

const isNavigationKey = (event: KeyboardEvent) =>
  event.key.includes("Arrow") || event.key === "Tab" || event.key === "Escape";

/**
 * Creates a keydown handler that detects editing-trigger keys and calls the
 * appropriate callback:
 * - Enter (without Shift) / Space → `onExpandAndStartEditing`
 * - Backspace / printable characters (key.length === 1, no Ctrl/Cmd, no Alt)
 *   → `onStartEditing`
 *
 * Navigation keys (Arrow, Tab, Escape) and modifier combos (Ctrl/Cmd, Alt)
 * are ignored and left for other handlers.
 */
export const useStartEditingKeydown = ({
  onExpandAndStartEditing,
  onStartEditing,
}: {
  onExpandAndStartEditing: (initialValue?: string) => void;
  onStartEditing: (initialValue?: string) => void;
}) => {
  const onKeydown = (event: KeyboardEvent) => {
    if (isNavigationKey(event) || event[getMetaOrCtrlKey()]) {
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      onExpandAndStartEditing();
    } else if (event.key === " ") {
      event.preventDefault();
      onExpandAndStartEditing(" ");
    } else if (event.key === "Backspace") {
      onStartEditing("");
    } else if (!event.altKey && event.key.length === 1) {
      event.preventDefault();
      onStartEditing(event.key);
    }
  };

  return { onKeydown };
};
