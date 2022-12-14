import { ref, computed, watch } from 'vue';
import { getNextPage } from '@/util/getNextPage';
import { paginate } from '@/util/transform/paginate';

export default ({ withPagination, pageSize, currentTableSize }) => {
    const currentPage = ref(1);
    const currentPageSize = withPagination ? ref(pageSize) : currentTableSize;
    const pageRowCount = ref(0);

    const goToFirstPage = () => {
        currentPage.value = 1;
    };

    const onPageChange = (pageNumberDiff) => {
        consola.debug(`Table received: pageChange ${pageNumberDiff}`);
        let proposedPage = currentPage.value + pageNumberDiff;
        let isWithinRange = (proposedPage * currentPageSize.value - currentTableSize.value) < currentPageSize.value;
        if (proposedPage > 0 && isWithinRange) {
            currentPage.value = proposedPage;
        }
    };
     
    const onPageSizeUpdate = (newPageSize) => {
        consola.debug(`Table received: pageSizeUpdate ${newPageSize}`);
        currentPageSize.value = newPageSize;
        let newPageNumber =
                getNextPage(currentPageSize.value, currentPage.value, currentTableSize.value, pageRowCount.value);
            // only update if changed to avoid unneeded computations
        if (newPageNumber && newPageNumber !== currentPage.value) {
            currentPage.value = newPageNumber;
        }
    };

    const pageStart = computed(() => currentPageSize.value * (currentPage.value - 1));
    const pageEnd = computed(() => currentPageSize.value * currentPage.value);
           
    const paginateData = ({ sortedData, sortedIndicies }) => {
        consola.trace('Paginating data.');
        const { paginatedData, paginatedIndicies } = paginate({
            sortedData,
            processedIndicies: sortedIndicies,
            pageSize: currentPageSize.value,
            pageStart: pageStart.value,
            pageEnd: pageEnd.value
        });
        pageRowCount.value = paginatedData.reduce((count, groupData) => groupData.length + count, 0);
        return { paginatedData, paginatedIndicies };
    };

    watch(() => pageRowCount.value, (newCount) => {
        if (newCount === 0) {
            onPageSizeUpdate(currentPageSize.value);
        }
    });

    const pageHash = computed(() => ({
        currentPage: currentPage.value,
        currentPageSize: currentPageSize.value
    }));

    return {
        goToFirstPage,
        onPageChange,
        onPageSizeUpdate,
        currentPage,
        currentPageSize,
        pageHash,
        pageStart,
        pageEnd,
        paginateData
    };
};
