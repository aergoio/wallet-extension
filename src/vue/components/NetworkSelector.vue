<template>
  <span class="network-selector" :title="blockHeight">
    <span class="network-icon" v-bind:style="styleObject"></span>
    localhost 7845
    (#{{blockHeight}})
  </span>
</template>

<script>
import controller from '../../controller';

export default {
  data () {
    return {
      isConnected: false,
      blockHeight: 0
    }
  },
  created () {
    this.updateStatus();
  },
  beforeDestroy () {
  },
  computed: {
    styleObject () {
      const color = '#F91263';
      if (this.$data.isConnected) {
        return {
          backgroundColor: color,
          borderColor: color
        }
      } else {
        return {
          borderColor: color
        }
      }
      
    }
  },
  methods: {
    updateStatus () {
      controller.blockchain().then(status => {
        this.$data.isConnected = true;
        this.$data.blockHeight = status.getBestHeight();

        setTimeout(() => {
          this.updateStatus();
        }, 5000);
      }).catch(error => {
        this.$data.isConnected = false;
        console.error('Could not connect to blockchain.', error);

        setTimeout(() => {
          this.updateStatus();
        }, 30000); // Retry after 30s
      });
    }
  },
  components: {
  }
};
</script>

<style lang="scss">
.network-selector {
  font-size: 75%;
  text-transform: uppercase;
  font-weight: 500;
}
.network-icon {
  display: inline-block;
  vertical-align: baseline;
  width: 4px;
  height: 4px;
  margin-right: 2px;
  border: 1px solid transparent;
  border-radius: 100%;
  background-color: #eee;
  position: relative;
  bottom: 1px;
}
</style>