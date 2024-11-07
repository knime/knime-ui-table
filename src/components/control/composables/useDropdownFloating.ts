import { useFloating, size, autoUpdate } from "@floating-ui/vue";

type UseFloatingParams = Parameters<typeof useFloating>;
type ReferenceType = UseFloatingParams[0];
type FloatingType = UseFloatingParams[1];

export const useDropdownFloating = (
  reference: ReferenceType,
  floating: FloatingType,
  openUp: boolean = false,
): any =>
  useFloating(reference, floating, {
    placement: openUp ? "top-end" : "bottom-start",
    strategy: "absolute",
    whileElementsMounted: autoUpdate,
    middleware: [
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
          });
        },
      }),
    ],
  });
