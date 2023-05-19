import { months } from './time.config';
import type { FilterComponent } from '@/types/FilterConfig';

export const defaultPageSize = 10;

export const tablePageSizes = [5, 10, 25, 50, 100];

export const filterComponents: Record<string, { is: keyof typeof FilterComponent, getInitialValue: () => any }> = {
    Multiselect: {
        is: 'ControlMultiselect',
        getInitialValue: () => []
    },
    InputField: {
        is: 'FilterInputField',
        getInitialValue: () => ''
    },
    Dropdown: {
        is: 'ControlDropdown',
        getInitialValue: () => ''
    }
};

export const columnTypes = {
    Nominal: 'Nominal',
    String: 'String',
    DateTime: 'DateTime',
    Number: 'Number',
    Boolean: 'Boolean',
    Array: 'Array',
    Object: 'Object'
};

export const columnFilterConfigs = {
    [columnTypes.Nominal]: filterComponents.Multiselect,
    [columnTypes.String]: filterComponents.InputField,
    [columnTypes.DateTime]: filterComponents.InputField,
    [columnTypes.Number]: filterComponents.InputField,
    [columnTypes.Boolean]: filterComponents.Dropdown,
    [columnTypes.Array]: filterComponents.InputField,
    [columnTypes.Object]: filterComponents.InputField,
    // @ts-ignore
    // eslint-disable-next-line no-undefined
    [undefined]: filterComponents.InputField
};

export const valueTypeFormatters = {
    Nominal: (val: any) => val,
    String: (val: any) => val,
    DateTime: (val: any) => {
        try {
            const separator = val.includes('.') ? '.' : '+';
            const utcDateTime = val.split(separator)[0];
            // date instance
            const di = new Date(utcDateTime);
            // human readable date parts
            const hrdp = {
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
                hrdp.hour = Number(`0${hrdp.hour}`);
            }
            if (hrdp.minute < 10) {
                hrdp.minute = Number(`0${hrdp.minute}`);
            }
            // @ts-ignore
            return `${months[hrdp.month]} ${hrdp.day}, ${hrdp.year}, ${hrdp.hour}:${hrdp.minute}`;
        } catch (_error) {
            return val;
        }
    },
    Number: (val: any) => val?.toString(),
    Boolean: (val: any) => val?.toString(),
    Array: (val: any) => val?.length ? `${val.length} items` : '-',
    Object: (val: any) => val ? `${Object.keys(val).length} items` : '-'
};

export const typeFormatters = (
    type: keyof typeof valueTypeFormatters
) => (val: any) => valueTypeFormatters[type](val);
