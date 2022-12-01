<script>

export default {
    props: {
        height: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            fontSize: 25
        };
    }
    
};
</script>

<template>
  <div
    class="dots"
    :style="{ height:`${height}px`}"
  >
    <span
      :style="{ fontSize: `${fontSize}px`}"
    >
      &vellip;
    </span>
  </div>
</template>

<style lang="postcss" scoped>
.dots {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  & span {
    text-align: center;
    pointer-events: none;
  }
}

</style>
