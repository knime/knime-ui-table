const isNonEmptyObject = (val) => val !== null &&
    typeof val === 'object' &&
    Object.getOwnPropertyNames(val).length > 0;

const isObjectRepresentation = (val) => {
    const possibleKeys = ['value', 'metadata', 'color'];
    return isNonEmptyObject(val) && Object.getOwnPropertyNames(val).every(key => possibleKeys.includes(key));
};

export const unpackObjectRepresentation = (val) => {
    if (isObjectRepresentation(val)) {
        if (val.hasOwnProperty('metadata') && !val.hasOwnProperty('value')) {
            return null;
        }
        return val.value;
    }
    return val;
};

export const getColor = (val) => {
    if (isObjectRepresentation(val) && val.hasOwnProperty('color')) {
        return val.color;
    }
    return null;
};

export const isMissingValue = (val) => val === null || (
    isObjectRepresentation(val) &&
    val?.hasOwnProperty('metadata')
);
export const isEmpty = (val) => typeof unpackObjectRepresentation(val) === 'undefined';
