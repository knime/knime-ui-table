<script>
/**
 * This popover rendering component is used to display data of type String in
 * an intuitive way. It will break words to always display without scroll bars.
 */
export default {
    props: {
        data: {
            type: String,
            default: null
        }
    }
};
</script>

<template>
  <div v-if="data">{{ data }}</div>
</template>

<style lang="postcss" scoped>

div {
  word-break: break-all;
  min-width: 200px;
}
</style>
