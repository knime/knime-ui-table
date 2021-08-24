<script>
/**
 * This popover rendering component is used to display data of type Object in
 * an intuitive way. It attempts to "pretty-print" the provided data to allow
 * easier viewing.
 */
export default {
    props: {
        data: {
            type: null,
            default: null
        }
    },
    computed: {
        formattedData() {
            if (!this.data) {
                return null;
            }
            let parsedData = this.data;
            if (typeof parsedData === 'string') {
                // only parse potential valid JSON to avoid extra '""'
                if (!this.data.includes('{')) {
                    return this.data;
                }
                try {
                    parsedData = JSON.parse(parsedData);
                } catch (e) {
                    // do nothing
                }
            }
            // eslint-disable-next-line no-undefined
            parsedData = JSON.stringify(parsedData, undefined, 2);
            return parsedData;
        }
    }
};
</script>

<template>
  <div v-if="formattedData">{{ formattedData }}</div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

pre {
  margin: 0;
  font-size: 13px;
}

div {
  overflow: auto;
  white-space: pre;
  word-break: break-word;
  line-height: 20px;
}
</style>
