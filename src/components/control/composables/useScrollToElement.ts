import type { Ref } from "vue";

// Note that for element inside a teleported popover,
// this yields the position relative to the top teleported element.
const getPositionRelativeToRoot = (element: HTMLElement) => {
  let distance = 0;
  while (element) {
    distance += element.offsetTop - (element.offsetParent?.scrollTop ?? 0);
    element = element.offsetParent as HTMLElement;
  }
  return distance;
};

// A composable for making an element which is inside a list of elemnts inside a
// popover visible on the screen by scrolling the popover and the window if necessary.
export const useScrollToElement = ({
  toggleButton,
}: {
  toggleButton: Ref<HTMLElement | null>;
}) => {
  const getToggleButtonBottom = () => {
    const toggleButtonElement = toggleButton.value;
    if (toggleButtonElement === null) {
      return 0;
    }
    const toggleButtonOffset = getPositionRelativeToRoot(toggleButtonElement);
    const toggleButtonHeight = toggleButtonElement.scrollHeight;
    return toggleButtonOffset + toggleButtonHeight;
  };

  const scrollPopoverTo = (element: HTMLElement) => {
    const listBoxNode = element.offsetParent;
    if (listBoxNode && listBoxNode.scrollHeight > listBoxNode.clientHeight) {
      const scrollBottom = listBoxNode.clientHeight + listBoxNode.scrollTop;
      const elementBottom = element.offsetTop + element.offsetHeight;
      if (elementBottom > scrollBottom) {
        listBoxNode.scrollTop = elementBottom - listBoxNode.clientHeight;
      } else if (element.offsetTop < listBoxNode.scrollTop) {
        listBoxNode.scrollTop = element.offsetTop;
      }
    }
  };

  const scrollWindowTo = (element: HTMLElement) => {
    const elementOffsetToToggleButton = getPositionRelativeToRoot(element);
    const toggleButtonBottom = getToggleButtonBottom();
    const elementOffsetTotal = toggleButtonBottom + elementOffsetToToggleButton;

    // We want a margin from the top / bottom of the screen to the current selected element
    const pageYOffset = 20;
    const pageYMin = elementOffsetTotal - pageYOffset;
    const pageYMax = elementOffsetTotal + element.scrollHeight + pageYOffset;

    if (window.scrollY + window.innerHeight < pageYMax) {
      const newYOffset = pageYMax - window.innerHeight;
      window.scrollTo(window.scrollX, newYOffset);
    } else if (window.scrollY > pageYMin) {
      window.scrollTo(window.scrollX, pageYMin);
    }
  };

  const scrollTo = (element: HTMLElement) => {
    scrollPopoverTo(element);
    scrollWindowTo(element);
  };

  return { scrollTo };
};
