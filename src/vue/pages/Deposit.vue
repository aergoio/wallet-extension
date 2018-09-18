<template>
  <div class="scroll-view">
    <div class="qrcode-container">
      <QRCode :data="$route.params.address" />
    </div>

    <p class="instruction">
      You can directly deposit to this address.
    </p>
    <p class="instruction">{{$route.params.address}}</p>
  </div>
</template>

<script>
import QRCode from '../components/QRCode';

export default {
  data () {
    return {
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
  },
  components: {
    QRCode,
  }
};
</script>

<style lang="scss">
.qrcode-container {
  .qrcode {
    width: 140px;
    height: 140px;
    margin: 0 auto;
  }
}
.instruction {
  text-align: center;
  margin: 0;
}
</style>