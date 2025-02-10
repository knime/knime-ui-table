import { computed, ref } from "vue";

import { group } from "@/util/transform/group";

export default ({ columnData: { allColumnHeaders, allColumnKeys } }) => {
  const currentGroup = ref("");
  const groupTitles = ref([]);

  /*
   * Column key of the current group-by column.
   */
  const groupColumnKey = computed(
    () => allColumnKeys[allColumnHeaders.indexOf(currentGroup.value)],
  );

  const groupData = ({ filteredData, filteredIndicies }) => {
    consola.trace("Grouping data.");
    // declare locally to avoid asynchronous behavior
    const result = group({
      filteredData,
      filteredIndicies,
      groupColumn: currentGroup.value,
      groupColumnKey: groupColumnKey.value,
    });
    groupTitles.value = result.groupTitles;
    return result;
  };

  const onGroupUpdate = (group) => {
    consola.debug(`Table received: groupUpdate ${group}`);
    currentGroup.value = group;
  };

  const groupHash = computed(() => ({
    currentGroup: currentGroup.value,
  }));

  return {
    groupData,
    groupHash,
    groupTitles,
    currentGroup,
    onGroupUpdate,
    groupColumnKey,
  };
};
