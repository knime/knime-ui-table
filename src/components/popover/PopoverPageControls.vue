<script>
import { FunctionButton } from "@knime/components";
import ArrowNextIcon from "@knime/styles/img/icons/arrow-next.svg";
import ArrowPrevIcon from "@knime/styles/img/icons/arrow-prev.svg";

/**
 * This component provides popover pagination controls for content with a variable length.
 *
 * @emits nextPage event.
 * @emits prevPage event.
 */
export default {
  components: {
    ArrowNextIcon,
    FunctionButton,
    ArrowPrevIcon,
  },
  props: {
    totalPages: {
      type: Number,
      default: 0,
    },
    currentPage: {
      type: Number,
      default: 0,
    },
  },
  emits: ["nextPage", "prevPage"],
  methods: {
    onNextPage() {
      consola.debug("Next Page");
      this.$emit("nextPage");
    },
    onPrevPage() {
      consola.debug("Prev Page");
      this.$emit("prevPage");
    },
  },
};
</script>

<template>
  <div class="controls">
    <FunctionButton @click="onPrevPage">
      <ArrowPrevIcon />
    </FunctionButton>
    {{ currentPage + 1 }} of {{ totalPages }}
    <FunctionButton @click="onNextPage">
      <ArrowNextIcon />
    </FunctionButton>
  </div>
</template>

<style lang="postcss" scoped>
.controls {
  display: flex;
  align-items: center;
  justify-content: center;

  & svg {
    position: relative;
    margin: auto;
    width: 18px;
    height: 18px;
    stroke-width: calc(32px / 18);
    stroke: var(--knime-masala);
    top: 0;
  }

  & :deep(button) {
    width: 20px;
    height: 20px;
    padding: 3px !important;
    margin: 3px;

    & svg {
      height: 13px;
      width: 13px;
    }
  }
}
</style>
