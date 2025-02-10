import { computed, onMounted, ref, unref, watch } from "vue";
import _ from "lodash-es";

export default ({
  filter: { filterData, filterHash },
  group: { groupData, groupHash },
  sort: { sortData, sortHash },
  paginate: { paginateData, pageHash, goToFirstPage },
  allData,
  updateDomains,
}) => {
  const filteredData = ref(null);
  const groupedData = ref(null);
  const sortedData = ref(null);
  const paginatedData = ref([]);

  const paginatedIndicies = ref([]);

  const pageLevelUpdate = () => {
    const paginatedDataResult = paginateData(sortedData.value);
    paginatedData.value = paginatedDataResult.paginatedData;
    paginatedIndicies.value = paginatedDataResult.paginatedIndicies;
  };

  const sortLevelUpdate = () => {
    sortedData.value = sortData(groupedData.value);
    pageLevelUpdate();
  };

  const groupLevelUpdate = () => {
    groupedData.value = groupData(filteredData.value);
    sortLevelUpdate();
  };

  const filterLevelUpdate = () => {
    filteredData.value = filterData(unref(allData));
    groupLevelUpdate();
  };

  const totalTableSize = ref(0);

  const processLevel = ref(null);

  const hashChangeHandler = (level, description, update) => () => {
    consola.trace(`New ${description.toLowerCase()} hash (watcher called).`);
    if (processLevel.value === null || processLevel.value > 1) {
      processLevel.value = 1;
      consola.trace(`${description} level update.`);
      update();
      processLevel.value = null;
    } else {
      consola.trace(
        `Blocked unnecessary ${description.toLowerCase()} reactivity.`,
      );
    }
  };

  watch(
    () => _.cloneDeep(filterHash.value),
    hashChangeHandler(1, "Filter", filterLevelUpdate),
  );
  watch(
    () => _.cloneDeep(groupHash.value),
    hashChangeHandler(1, "Group", groupLevelUpdate),
  );
  watch(
    () => _.cloneDeep(sortHash.value),
    hashChangeHandler(1, "Sort", sortLevelUpdate),
  );
  watch(
    () => _.cloneDeep(pageHash.value),
    hashChangeHandler(1, "Page", pageLevelUpdate),
  );
  watch(
    () => filterHash.value.searchQuery,
    (newVal) => newVal && goToFirstPage(),
  );
  watch(() => filterHash.value.currentTimeFilter, goToFirstPage);
  watch(
    () => groupHash.value.currentGroup,
    (newVal) => newVal && goToFirstPage(),
  );
  watch(
    () => sortHash.value.columnSort,
    (newVal, oldVal) => newVal !== oldVal && goToFirstPage(),
  );

  const onAllDataUpdate = () => {
    updateDomains(allData);
    if (totalTableSize.value !== allData.length) {
      totalTableSize.value = allData.length;
    }
    if (
      paginatedData.value === null ||
      processLevel.value === null ||
      processLevel.value > 1
    ) {
      processLevel.value = 1;
      filterLevelUpdate();
      processLevel.value = null;
    } else {
      consola.trace("Blocked unnecessary filter reactivity.");
    }
  };

  onMounted(() => {
    if (allData.length) {
      onAllDataUpdate();
    }
  });

  const processedIndicies = computed(() => sortedData.value.sortedIndicies);

  return {
    paginatedData,
    paginatedIndicies,
    processedIndicies,
    totalTableSize,
    groupLevelUpdate,
    sortLevelUpdate,
    pageLevelUpdate,
  };
};
