import usePopper from 'webapps-common/ui/composables/usePopper';
import type { PopperTargets } from 'webapps-common/ui/composables/usePopper';
import type { ModifierArguments, Options } from '@popperjs/core';

const setWidth = ({
    instance: {
        state: {
            rects: {
                reference
            },
            elements: {
                popper
            }
        }
    }
} : ModifierArguments<Options>) => {
    popper.style.minWidth = `${reference.width}px`;
};


const useDropdownPopper = (targets: PopperTargets, openUp: boolean = false) => usePopper(
    targets,
    {
        placement: openUp ? 'top-end' : 'bottom-start',
        strategy: 'absolute',
        modifiers: [{ // disbale flip
            name: 'flip',
            options: {
                fallbackPlacements: []
            }
        },
        {
            name: 'setWidth',
            phase: 'beforeRead',
            enabled: true,
            fn: setWidth
        },
        {
            name: 'eventListeners',
            options: {
                scroll: true,
                resize: true
            }
        }]
    }
);


export default useDropdownPopper;
