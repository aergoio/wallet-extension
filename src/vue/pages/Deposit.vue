<template>
  <div class="scroll-view">
    <div class="qrcode-container">
      <QRCode :data="$route.params.address" />
    </div>

    <p class="instruction">
      You can directly deposit to this address.
    </p>
    <p class="instruction instruction-address"><span class="chain">{{chainId}}</span><br>{{address}}</p>
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
    chainId() {
      return this.$route.params.address && this.$route.params.address.split('/')[0];
    },
    address() {
      return this.$route.params.address && this.$route.params.address.split('/')[1];
    }
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
  padding: 10px;
}
.instruction-address {
  font-size: 1.1em;
}
</style>