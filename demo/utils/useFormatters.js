import { ref, computed } from 'vue';
import { typeFormatters } from '@/config/table.config';

import getColumnDomains from '@/util/getColumnDomains';

export default ({ allColumnsData: { allColumnTypes, allColumnKeys, allFormatters }, currentColumnKeys }) => {
    const domains = ref([]);
    const defaultFormatters = allColumnKeys.reduce((formatters, colKey) => {
        formatters[colKey] = allFormatters[colKey] ||
           typeFormatters[allColumnTypes[colKey]] ||
           (item => item);
        return formatters;
    }, {});

    const updateDomains = (allData) => {
        domains.value = getColumnDomains({
            data: allData,
            formatters: defaultFormatters,
            types: allColumnTypes
        });
    };

    const currentFormatters = computed(() => currentColumnKeys.value.map(colKey => defaultFormatters[colKey]));

    return { domains, updateDomains, currentFormatters };
};
