import { shallowMount } from '@vue/test-utils';
import Table from '~/components/Table';
import TableControlsTop from '~/components/control/TableControlTop';
import TableControlsBottom from '~/components/control/TableControlBottom';
import TableColumnFilters from '~/components/filter/TableColumnFilter';
import TableHeader from '~/components/TableHeader';
import TableGroup from '~/components/TableGroup';
import TableRow from '~/components/TableRow';
import TableActionButton from '~/components/ui/TableActionButton';
import TablePopover from '~/components/popover/TablePopover';

import { columnTypes } from '~/config/table.config';

describe('Table.vue', () => {
    let wrapper;

    let propsData = {
        allData: [{ a: 1, b: 2 }],
        allColumnHeaders: ['A', 'B'],
        allColumnKeys: ['a', 'b'],
        allColumnTypes: { a: columnTypes.Number, b: columnTypes.Number },
        allFormatters: { a: x => x, b: x => x },
        allClassGenerators: {}
    };

    describe('rendering', () => {
        it('renders', () => {
            wrapper = shallowMount(Table);

            expect(wrapper.find(Table).exists()).toBe(true);
            expect(wrapper.find(TableControlsTop).exists()).toBe(true);
            expect(wrapper.find(TableControlsBottom).exists()).toBe(true);
            expect(wrapper.find(TableColumnFilters).exists()).toBe(false);
            expect(wrapper.find(TableHeader).exists()).toBe(true);
            expect(wrapper.find(TableGroup).exists()).toBe(false);
            expect(wrapper.find(TableRow).exists()).toBe(false);
            expect(wrapper.find(TableActionButton).exists()).toBe(false);
            expect(wrapper.find(TablePopover).exists()).toBe(false);
        });

        it('shows time filter controls via prop', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    showTimeFilter: false
                }
            });

            expect(wrapper.find(Table).exists()).toBe(true);
            expect(wrapper.find(TableControlsTop).exists()).toBe(true);
            expect(wrapper.find(TableControlsTop).vm.showTimeFilter).toBe(false);
        });

        it('shows column selection via prop', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    showColumns: false
                }
            });

            expect(wrapper.find(Table).exists()).toBe(true);
            expect(wrapper.find(TableControlsTop).exists()).toBe(true);
            expect(wrapper.find(TableControlsTop).vm.showColumns).toBe(false);
        });

        it('shows group-by controls via prop', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    showGroups: false
                }
            });

            expect(wrapper.find(Table).exists()).toBe(true);
            expect(wrapper.find(TableControlsTop).exists()).toBe(true);
            expect(wrapper.find(TableControlsTop).vm.showGroups).toBe(false);
        });

        it('shows search controls via prop', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    showSearch: false
                }
            });

            expect(wrapper.find(Table).exists()).toBe(true);
            expect(wrapper.find(TableControlsTop).exists()).toBe(true);
            expect(wrapper.find(TableControlsTop).vm.showSearch).toBe(false);
        });

        it('enables column filters via prop', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    showColumnFilters: false
                }
            });

            expect(wrapper.find(Table).exists()).toBe(true);
            expect(wrapper.find(TableHeader).exists()).toBe(true);
            expect(wrapper.find(TableHeader).vm.showColumnFilters).toBe(false);
            expect(wrapper.find(TableColumnFilters).exists()).toBe(false);
        });

        it('shows bottom controls via prop', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    showBottomControls: false
                }
            });

            expect(wrapper.find(Table).exists()).toBe(true);
            expect(wrapper.find(TableControlsBottom).exists()).toBe(false);
        });

        it('shows row collapsers via prop', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    showCollapser: false
                }
            });

            expect(wrapper.find(Table).exists()).toBe(true);
            expect(wrapper.find(TableHeader).exists()).toBe(true);
            expect(wrapper.find(TableHeader).vm.showCollapser).toBe(false);
            expect(wrapper.find(TableRow).exists()).toBe(true);
            expect(wrapper.find(TableRow).vm.showCollapser).toBe(false);
        });

        it('enables selection via prop', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    showSelection: false
                }
            });

            expect(wrapper.find(Table).exists()).toBe(true);
            expect(wrapper.find(TableHeader).exists()).toBe(true);
            expect(wrapper.find(TableHeader).vm.showSelection).toBe(false);
            expect(wrapper.find(TableRow).exists()).toBe(true);
            expect(wrapper.find(TableRow).vm.showSelection).toBe(false);
        });

        it('enables action button via prop', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    showActionButton: true,
                    showBottomControls: false
                }
            });

            expect(wrapper.find(Table).exists()).toBe(true);
            expect(wrapper.find(TableControlsBottom).exists()).toBe(false);
            expect(wrapper.find(TableActionButton).exists()).toBe(true);
        });
    });

    describe('configuration creation', () => {
        it('computes empty configurations from data and empty default columns', () => {
            wrapper = shallowMount(Table, { propsData });

            expect(wrapper.vm.allFilterConfigs).toStrictEqual(
                {
                    a: { domain: [1, 1], value: [] },
                    b: { domain: [2, 2], value: [] }
                }
            );
            expect(wrapper.vm.allGroups).toStrictEqual([]);
            expect(wrapper.vm.defaultFilterValues).toStrictEqual({ a: [], b: [] });
            expect(wrapper.vm.currentColumns).toStrictEqual([]);
            expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([0, 1]);
            expect(wrapper.vm.columnSizes).toStrictEqual([]);
            expect(wrapper.vm.masterSelected).toStrictEqual([0]);
            expect(wrapper.vm.allHeadersOrdered).toStrictEqual(['A', 'B']);
            expect(wrapper.vm.currentHeaders).toStrictEqual([]);
            expect(wrapper.vm.currentColumnKeys).toStrictEqual([]);
            expect(wrapper.vm.currentColumnTypes).toStrictEqual([]);
            expect(wrapper.vm.currentFormatters).toStrictEqual([]);
            expect(wrapper.vm.currentClassGenerators).toStrictEqual([]);
            expect(wrapper.vm.currentEditableColumns).toStrictEqual([]);
            expect(wrapper.vm.currentSlottedColumns).toStrictEqual([]);
            expect(wrapper.vm.currentFilterConfigs).toStrictEqual([]);
            expect(wrapper.vm.groupColumnKey).toBe(undefined);
            expect(wrapper.vm.pageStart).toBe(0);
            expect(wrapper.vm.pageEnd).toBe(10);
        });

        it('computes configurations from data for default columns', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            let testFilterConfig = {
                a: { domain: [1, 1], value: [] },
                b: { domain: [2, 2], value: [] }
            };

            expect(wrapper.vm.allFilterConfigs).toStrictEqual(testFilterConfig);
            expect(wrapper.vm.allGroups).toStrictEqual([]);
            expect(wrapper.vm.defaultFilterValues).toStrictEqual({ a: [], b: [] });
            expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
            expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([0, 1]);
            expect(wrapper.vm.columnSizes).toStrictEqual([50, 50]);
            expect(wrapper.vm.masterSelected).toStrictEqual([0]);
            expect(wrapper.vm.allHeadersOrdered).toStrictEqual(['A', 'B']);
            expect(wrapper.vm.currentHeaders).toStrictEqual(['A', 'B']);
            expect(wrapper.vm.currentColumnKeys).toStrictEqual(['a', 'b']);
            expect(wrapper.vm.currentColumnTypes).toStrictEqual([columnTypes.Number, columnTypes.Number]);
            expect(wrapper.vm.currentFormatters).toStrictEqual([expect.any(Function), expect.any(Function)]);
            expect(wrapper.vm.currentClassGenerators).toStrictEqual([[], []]);
            expect(wrapper.vm.currentEditableColumns).toStrictEqual([null, null]);
            expect(wrapper.vm.currentSlottedColumns).toStrictEqual([null, null]);
            expect(wrapper.vm.currentFilterConfigs).toStrictEqual([testFilterConfig.a, testFilterConfig.b]);
            expect(wrapper.vm.groupColumnKey).toBe(undefined);
            expect(wrapper.vm.pageStart).toBe(0);
            expect(wrapper.vm.pageEnd).toBe(10);
        });

        it('configures formatters provided via props', () => {
            let aFn = x => x.toString();
            let bFn = x => x + 100;
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b'],
                    allFormatters: {
                        a: aFn,
                        b: bFn
                    }
                }
            });
            expect(wrapper.vm.currentFormatters).toStrictEqual([aFn, bFn]);
        });

        it('configures class generators provided via props', () => {
            let aClassGenerators = [x => `${x}-width`, 'a'];
            let bClassGenerators = [x => `${x}-height`, 'b'];
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b'],
                    allClassGenerators: {
                        a: aClassGenerators,
                        b: bClassGenerators
                    }
                }
            });
            expect(wrapper.vm.currentClassGenerators).toStrictEqual([aClassGenerators, bClassGenerators]);
        });

        it('configures editable columns provided via props', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b'],
                    allEditableColumns: {
                        a: 'NumberInput',
                        b: 'Toggle'
                    }
                }
            });
            expect(wrapper.vm.currentEditableColumns).toStrictEqual(['NumberInput', 'Toggle']);
        });

        it('configures slotted columns provided via props', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b'],
                    allSlottedColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.currentSlottedColumns).toStrictEqual([0, 1]);
        });

        it('configures time filter via props', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    timeFilterKey: 'a',
                    defaultTimeFilter: 'Last month'
                }
            });
            expect(wrapper.vm.currentTimeFilter).toStrictEqual('Last month');
        });

        it('accepts seed selection via props', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    parentSelected: [0]
                }
            });
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
        });
    });
});
