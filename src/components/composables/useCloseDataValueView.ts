import rafThrottle from "raf-throttle";
import { onMounted, onUnmounted, watch, type Ref } from "vue";

export default ({
  scrollContainer,
  closeDataValueView,
}: {
  scrollContainer: Ref<null | HTMLElement>;
  closeDataValueView: () => void;
}) => {
  watch(
    () => scrollContainer.value,
    () => {
      if (scrollContainer.value) {
        scrollContainer.value.addEventListener(
          "scroll",
          rafThrottle(closeDataValueView),
        );
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    window.addEventListener("resize", closeDataValueView);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", closeDataValueView);
    closeDataValueView();
  });
};
