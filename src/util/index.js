export const isMissingValue = (val) => val === null || (typeof val !== 'undefined' && val?.hasOwnProperty('metadata'));
