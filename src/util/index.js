export const isMissingValue = (val) => val === null || (typeof val !== 'undefined' && val?.hasOwnProperty('metadata'));
export const isEmpty = (val) => typeof val === 'undefined';
