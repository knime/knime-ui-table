import { months } from './time.config';

export const tablePageSizes = [5, 10, 25, 50, 100];

export const columnTypes = {
    Nominal: 'Nominal',
    String: 'String',
    DateTime: 'DateTime',
    Number: 'Number',
    Boolean: 'Boolean',
    Array: 'Array',
    Object: 'Object'
};

export const createEmptyTypeValues = {
    Nominal: () => [],
    String: () => '',
    DateTime: () => '',
    Number: () => NaN,
    Boolean: () => null,
    Array: () => [],
    Object: () => ({})
};

export const columnFilterTypes = {
    [columnTypes.Nominal]: 'TableFilterMultiselect',
    [columnTypes.String]: 'TableFilterInputField',
    [columnTypes.DateTime]: 'TableFilterInputField',
    [columnTypes.Number]: 'TableFilterInputField',
    [columnTypes.Boolean]: 'TableFilterDropdown',
    [columnTypes.Array]: 'TableFilterInputField',
    [columnTypes.Object]: 'TableFilterInputField',
    // eslint-disable-next-line no-undefined
    [undefined]: 'TableFilterInputField'
};

export const columnTypeEmptyFilters = {
    [columnTypes.Nominal]: [],
    [columnTypes.String]: '',
    [columnTypes.DateTime]: '',
    [columnTypes.Number]: [],
    [columnTypes.Boolean]: [],
    [columnTypes.Array]: '',
    [columnTypes.Object]: '',
    // eslint-disable-next-line no-undefined
    [undefined]: ''
};

export const typeFormatters = {
    Nominal: val => val,
    String: val => val,
    DateTime: val => {
        try {
            let separator = val.includes('.') ? '.' : '+';
            let utcDateTime = val.split(separator)[0];
            // date instance
            let di = new Date(utcDateTime);
            // human readable date parts
            let hrdp = {
                month: di.getMonth() + 1,
                day: di.getDate(),
                year: di.getFullYear(),
                hour: di.getHours(),
                minute: di.getMinutes()
            };
            if (Object.values(hrdp).some(part => !part && part !== 0)) {
                throw new SyntaxError('Can\'t parse date.');
            }
            if (hrdp.hour === 0) {
                hrdp.hour = `0${hrdp.hour}`;
            }
            if (hrdp.minute < 10) {
                hrdp.minute = `0${hrdp.minute}`;
            }
            return `${months[hrdp.month]} ${hrdp.day}, ${hrdp.year}, ${hrdp.hour}:${hrdp.minute}`;
        } catch (Error) {
            return val;
        }
    },
    Number: val => val.toString(),
    Boolean: val => val.toString(),
    Array: val => val?.length ? `${val.length} items` : '-',
    Object: val => val ? `${Object.keys(val).length} items` : '-'
};
