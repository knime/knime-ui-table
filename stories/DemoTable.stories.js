import DemoTable from './DemoTable.vue';
import consola from 'consola';
import { markRaw } from 'vue';
import DeleteIcon from 'webapps-common/ui/assets/img/icons/trash.svg';
import LinkIcon from 'webapps-common/ui/assets/img/icons/link.svg';

// More on default export: https://storybook.js.org/docs/vue/writing-stories/introduction#default-export
export default {
    title: 'TableUI',
    component: DemoTable,
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        initialSortDirection: {
            name: 'Initial sort direction',
            options: [1, -1],
            control: { type: 'radio' },
            table: {
                category: 'Sorting'
            }
        },
        initialSortColumn: {
            name: 'Initial sort column',
            table: {
                category: 'Sorting'
            }
        },
        initialFilterValues: {
            name: 'Initial column filters',
            table: {
                category: 'Filtering'
            }
        },
        allDataLength: {
            name: 'Total row count',
            table: {
                category: 'Data'
            }
        },
        withSorting: {
            name: 'Sorting',
            table: {
                category: 'Sorting'
            }
        },
        withTimeFilter: {
            name: 'Time filter',
            table: {
                category: 'Filtering'
            }
        },
        withColumnSelection: {
            name: 'Column selection',
            table: {
                category: 'Data'
            }
        },
        withGroupBy: {
            name: 'Group by',
            table: {
                category: 'Groups'
            }
        },
        withSearch: {
            name: 'Search',
            table: {
                category: 'Filtering'
            }
        },
        withColumnFilters: {
            name: 'Column filters',
            table: {
                category: 'Filtering'
            }
        },
        withHeaderSubMenu: {
            name: 'Header submenu',
            table: {
                category: 'Header'
            }
        },
        headerSubMenu: {
            name: 'Header submenu items',
            table: {
                categore: 'Header'
            }
        },
        showBottomControls: {
            name: 'Bottom controls',
            table: {
                category: 'Bottom controls'
            }
        },
        showCollapser: {
            name: 'Collapsers',
            table: {
                category: 'Rows'
            }
        },
        showSubHeaders: {
            name: 'Subheaders',
            table: {
                category: 'Header'
            }
        },
        withSelection: {
            name: 'Selection',
            table: {
                category: 'Rows'
            }
        },
        showActionButton: {
            name: 'Action button',
            table: {
                category: 'Bottom controls'
            }
        },
        showPopovers: {
            name: 'Popovers',
            table: {
                category: 'Rows'
            }
        },
        compactMode: {
            name: 'Compact rows',
            table: {
                category: 'Rows'
            }
        },
        enableVirtualScrolling: {
            name: 'Virtual scrolling',
            table: {
                category: 'Body'
            }
        },
        containerHeight: {
            name: 'Height of container',
            table: {
                category: 'Body'
            }
        },
        fixHeader: {
            name: 'Fix header',
            table: {
                category: 'Header'
            }
        },
        withPagination: {
            name: 'Pagination',
            table: {
                category: 'Pagination'
            }
        },
        pageSize: {
            name: 'Page size',
            table: {
                category: 'Pagination'
            }
        },
        showTableSize: {
            name: 'Show table size',
            table: {
                category: 'Header'
            }
        },
        showTopControls: {
            name: 'Show top controls',
            table: {
                category: 'Header'
            }
        },
        actionButtonText: {
            name: 'Action button text',
            table: {
                category: 'Bottom controls'
            }
        },
        showGroupSubMenus: {
            name: 'Group submenu',
            table: {
                category: 'Groups'
            }
        },
        showSubMenus: {
            name: 'Row submenu',
            table: {
                category: 'Rows'
            }
        },
        subMenuItems: {
            name: 'Row submenu options',
            table: {
                category: 'Rows'
            }
        },
        groupSubMenuItems: {
            name: 'Group submenu options',
            table: {
                category: 'Groups'
            }
        },
        numRowsAbove: {
            name: 'Empty rows above',
            table: {
                category: 'Body'
            }
        },
        numRowsBelow: {
            name: 'Empty rows below',
            table: {
                category: 'Body'
            }
        },
        allSlottedColumns: {
            name: 'Slotted columns',
            table: {
                category: 'Data'
            }
        },
        withSpecificSortConfigs: {
            name: 'Deactivate sorting for some columns',
            table: {
                category: 'Sorting'
            }
        }
    }
};

// More on component templates: https://storybook.js.org/docs/vue/writing-stories/introduction#using-args
const Template = (args) => {
    window.global.consola = consola;
    return {
        components: { DemoTable },
        setup(props) {
            return { args };
        },
        template: `<DemoTable v-bind="args" />`
    };
};

export const Hub = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Hub.args = {
    allDataLength: 11,
    withSorting: true,
    withColumnFilters: true,
    withPagination: true,
    pageSize: 10,
    initialFilterValues: { user: ['example-user2'] },
    initialSortColumn: 1,
    initialSortDirection: -1,
    withTimeFilter: true,
    withColumnSelection: true,
    withGroupBy: true,
    withSearch: true,
    withHeaderSubMenu: false,
    showBottomControls: true,
    showCollapser: true,
    showSubHeaders: false,
    withSelection: true,
    showActionButton: true,
    showPopovers: true,
    compactMode: false,
    backgroundColor: '--knime-porcelain',
    enableVirtualScrolling: false,
    fixHeader: false,
    showTableSize: true,
    showTopControls: true,
    actionButtonText: 'action',
    showGroupSubMenus: true,
    showSubMenus: true,
    subMenuItems: [
        {
            name: 'delete',
            text: 'Delete',
            icon: markRaw(DeleteIcon),
            callback: (row, context) => {
                consola.debug(`Delete called with row ${row}`, context);
            }
        },
        {
            name: 'copy',
            text: 'Copy link',
            icon: markRaw(LinkIcon),
            callback: (row, context) => {
                consola.debug(`Copy link called with row ${row}`, context);
            }
        }
    ],
    groupSubMenuItems: [{
        name: 'delete',
        text: 'Delete all',
        icon: markRaw(DeleteIcon),
        callback: (row, context) => {
            consola.debug(`Group delete all called with row ${row}`, context);
        }
    }],
    allSlottedColumns: ['status']
};


export const TableView = Template.bind({});

TableView.args = {
    allDataLength: 200,
    withSorting: true,
    withPagination: false,
    withColumnFilters: true,
    withSpecificSortConfigs: true,
    withTimeFilter: false,
    withColumnSelection: false,
    withGroupBy: false,
    withSearch: true,
    withHeaderSubMenu: true,
    headerSubMenu: [
        { text: 'Section1', sectionHeadline: true, separator: true },
        { text: 'Item 1', id: 's1i1', selected: true, section: 'section1' },
        { text: 'Item 2', id: 's1i2', selected: false, section: 'section1' },
        { text: 'Section2', sectionHeadline: true, separator: true },
        { text: 'Item 1', id: 's2i1', selected: true, section: 'section2' },
        { text: 'Item 2', id: 's2i2', selected: false, section: 'section2' }
    ],
    showBottomControls: false,
    showCollapser: false,
    showSubHeaders: true,
    withSelection: true,
    showActionButton: false,
    showPopovers: false,
    compactMode: false,
    enableVirtualScrolling: true,
    containerHeight: '100%',
    backgroundColor: '--knime-porcelain',
    fixHeader: true,
    showTableSize: true,
    showTopControls: true,
    showSubMenus: false,
    showGroupSubMenus: false,
    numRowsAbove: 5,
    numRowsBelow: 5
};
