<script>

export default {
    components: {
       
    },
    props: {
        height: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            fontSize: 40
        };
    },
    computed: {
        marginTop() {
            return -this.fontSize + 1 - this.height / 2;
        }
    }
    
};
</script>

<template>
  <div
    class="dots"
    :style="{ height:`${height}px`}"
  >
    <span
      :style="{ fontSize: `${fontSize}px`, marginTop: `${marginTop}px`}"
    >
      &#x2026;
    </span>
  </div>
</template>

<style lang="postcss" scoped>

.dots {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  & span {
    pointer-events: none;
  }
}

</style>
