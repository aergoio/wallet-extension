<template>
  <div class="identicon">

  </div>
</template>

<script>
import jdenticon from "jdenticon";

export default {
  props: ['text'],
  data () {
    return {
    }
  },
  mounted () {
    this.$el.innerHTML = jdenticon.toSvg(this.$props.text, 200);
  },
};
</script>

<style lang="scss">
</style>
