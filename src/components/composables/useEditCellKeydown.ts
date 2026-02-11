/**
 *  This method returns true if we should stop processing the key event since it is
 *  to be ignored outside of the editing context.
 */
const isToBeIgnoredKeyEvent = (keyEvent: KeyboardEvent) => {
  // Ignore backspace and delete to prevent clearing the cell value while editing
  return keyEvent.key === "Backspace" || keyEvent.key === "Delete";
};

export const createEditingCellKeydownHandler = ({
  moveSelection,
}: {
  moveSelection: (
    horizontalMove: number,
    verticalMove: number,
    expandSelection: boolean,
  ) => void;
}) => {
  return (event: KeyboardEvent) => {
    if (isToBeIgnoredKeyEvent(event)) {
      event.stopPropagation();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      const horizontalMove = event.shiftKey ? -1 : 1;
      moveSelection(horizontalMove, 0, false);
    } else if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      moveSelection(0, 1, false);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      // Select the underlying cell again to stop editing
      moveSelection(0, 0, false);
    }
  };
};
