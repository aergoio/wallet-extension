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
  watch: {
    'text' (to, from) {
      this.load();
    }
  },
  methods: {
    load() {
      this.$el.innerHTML = jdenticon.toSvg(this.$props.text, 200);
    }
  },
  mounted () {
    this.load();
  },
};
</script>

<style lang="scss">
</style>
