import getWrappedAroundIndex from 'webapps-common/ui/util/getWrappedAroundIndex';

export default (
    current: number | null,
    direction: 1 | -1,
    elements: HTMLElement[]
) => {
    if (current === null) {
        if (direction === -1) {
            current = 0;
        } else {
            current = -1;
        }
    }
    const nextIndex = getWrappedAroundIndex(current + direction, elements.length);
    return { index: nextIndex, element: elements[nextIndex] };
};
