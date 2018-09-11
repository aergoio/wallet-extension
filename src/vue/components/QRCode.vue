<template>
  <div class="qrcode"></div>
</template>

<script>
import QRCode from 'qrcode';

export default {
  props: ['data'],
  data () {
    return {
    }
  },
  async mounted () {
    this.$el.innerHTML = await QRCode.toString(this.$props.data);
  },
};
</script>

<style lang="scss">
</style>

