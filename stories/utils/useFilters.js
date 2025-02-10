import { computed, ref, unref } from "vue";

import {
  getDefaultFilterValues,
  getFilterConfigs,
  getInitialFilterValues,
} from "@/util/getFilterConfigs";
import { filter } from "@/util/transform/filter";

export default ({
  initialParameters: { initialFilterValues, withColumnFilters },
  timeFilterKey,
  defaultTimeFilter,
  formatterData: { currentFormatters, domains },
  currentColumns,
  allColumns: { allColumnTypes, allColumnKeys },
}) => {
  const filterValues = ref(
    withColumnFilters && Boolean(Object.keys(unref(initialFilterValues)).length)
      ? getInitialFilterValues(
          allColumnKeys,
          allColumnTypes,
          unref(initialFilterValues),
        )
      : getDefaultFilterValues(allColumnKeys, allColumnTypes),
  );
  const currentTimeFilter = ref(defaultTimeFilter);
  const searchQuery = ref("");
  const showFilter = ref(
    withColumnFilters &&
      Boolean(Object.keys(unref(initialFilterValues)).length),
  );

  const currentTableSize = ref(0);

  const filterData = (data) => {
    consola.trace("Filtering data.");
    // declare locally to avoid asynchronous behavior
    let filterResult = filter({
      data,
      filterValues: filterValues.value,
      timeFilter: currentTimeFilter.value,
      timeFilterKey,
      searchQuery: searchQuery.value,
      showFilter: showFilter.value,
      columnKeys: currentColumns.value,
      formatters: currentFormatters.value,
      types: allColumnTypes,
    });
    currentTableSize.value = filterResult.filteredData.length;
    return filterResult;
  };

  const onTimeFilterUpdate = (newTimeFilter) => {
    consola.debug(`Table received: timeFilterUpdate ${newTimeFilter}`);
    currentTimeFilter.value = newTimeFilter;
  };

  const onColumnFilter = (colInd, value) => {
    consola.debug(`Table received: columnFilter ${colInd} ${value}`);
    let colKey = currentColumns.value[colInd];
    filterValues.value[colKey] = value;
  };
  const onClearFilter = () => {
    consola.debug("Table received: clearFilter");
    filterValues.value = getDefaultFilterValues(allColumnKeys, allColumnTypes);
  };
  const onToggleFilter = (filterActive) => {
    consola.debug(`Table received: toggleFilter ${filterActive}`);
    showFilter.value = filterActive;
  };

  const onSearch = (input) => {
    consola.debug(`Table received: search ${input}`);
    searchQuery.value = input || null;
  };

  const currentFilterConfigs = computed(() =>
    getFilterConfigs({
      domains: domains.value,
      columns: currentColumns.value,
      types: allColumnTypes,
      values: filterValues.value,
    }),
  );

  const filterHash = computed(() => ({
    filterValues: filterValues.value,
    showFilter: showFilter.value,
    currentFilterConfigs: currentFilterConfigs.value,
    currentTimeFilter: currentTimeFilter.value,
    searchQuery: searchQuery.value,
    currentColumnKeys: currentColumns.value,
  }));

  return {
    filterData,
    filterHash,
    onTimeFilterUpdate,
    onColumnFilter,
    onClearFilter,
    onToggleFilter,
    onSearch,
    currentTimeFilter,
    currentFilterConfigs,
    currentTableSize,
  };
};
