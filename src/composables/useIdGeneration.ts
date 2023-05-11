import { computed, type Ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export default (ids: Ref<string[]>, selectedIndex: Ref<null| number>, nodeTitle: string) => {
    const id = `${nodeTitle}-${uuidv4()}`;
    const generateId = (node: string, itemId?: string) => {
        if (!itemId) {
            return `$${id}-${node}`;
        }
        const cleanId = String(itemId).replace(/[^\w]/gi, '');
        return `${id}-${node}-${cleanId}`;
    };

    const generateOptionId = (itemId?: string) => generateId('option', itemId);
    const buttonId = generateId('button');

    const activeDescendantId = computed(() => {
        const activeDescendant = selectedIndex.value === null
            // eslint-disable-next-line no-undefined
            ? undefined
            : ids.value[selectedIndex.value];
        return generateOptionId(activeDescendant);
    });

    return { generateOptionId, activeDescendantId, buttonId };
};
