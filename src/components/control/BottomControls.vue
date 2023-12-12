<script lang="ts">
import type { PropType } from "vue";
import type { PageConfig } from "@/types/TableConfig";
import BaseControls from "./BaseControls.vue";
import ControlDropdown from "./ControlDropdown.vue";

/**
 * Table controls for the bottom of the table optionally consisting of page controls
 * and a drop-"up" selection input for table page size.
 *
 * @emits pageSizeUpdate when the page size it updated.
 * @emits $listeners from @see BaseControls
 */
export default {
  components: {
    BaseControls,
    ControlDropdown,
  },
  props: {
    pageConfig: {
      type: Object as PropType<PageConfig>,
      default: () => ({}),
    },
  },
  emits: ["pageSizeUpdate"],
  methods: {
    createText(size: number) {
      return `${size.toString()} per page`;
    },
    parseSize(sizeText: string) {
      let strSize = sizeText.split(" per")[0].trim();
      return parseInt(strSize, 10);
    },
    getSelectItems(itemArr: string[]) {
      return itemArr?.length
        ? itemArr.map((item) => ({ id: item, text: item }))
        : [];
    },
    onPageSizeSelect(newPageSize: string) {
      consola.debug("Updated table page size: ", newPageSize);
      this.$emit("pageSizeUpdate", this.parseSize(newPageSize));
    },
  },
};
</script>

<template>
  <BaseControls class="base-controls" v-bind="{ ...$props, ...$attrs }">
    <template #carousel>
      <!-- eslint-disable vue/attribute-hyphenation typescript complains with ':aria-label' instead of ':ariaLabel'-->
      <ControlDropdown
        open-up
        :model-value="createText(pageConfig.pageSize)"
        :ariaLabel="'Choose page size'"
        :possible-values="
          getSelectItems(
            (pageConfig.possiblePageSizes ?? []).map((num) => createText(num)),
          )
        "
        class="dropdown-controls"
        placeholder="Items per page"
        @update:model-value="onPageSizeSelect"
      />
    </template>
  </BaseControls>
</template>

<style lang="postcss" scoped>
.base-controls {
  & span {
    line-height: 50px;
  }

  & :deep(.function-button) {
    position: relative;
    margin: none;
    height: 28px;
    width: 28px;
    stroke-width: calc(32px / 20);
    stroke: var(--knime-dove-gray);
    top: 0;

    &:hover,
    &:focus {
      /* needed to override function-button styles */
      background: unset;
    }
  }

  & :deep(.dropdown [role="button"]) {
    border: none;
  }

  & :deep(.dropdown ul) {
    width: fit-content;
  }
}
</style>
