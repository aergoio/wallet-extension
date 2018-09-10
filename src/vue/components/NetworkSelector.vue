<template>
  <span class="network-selector">
    <span class="network-icon" style="background-color: #F91263"></span>
    localhost 7845
  </span>
</template>

<script>
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
  width: 5px;
  height: 5px;
  margin-right: 2px;
  border-radius: 100%;
  background-color: #eee;
  position: relative;
  bottom: 1px;
}
</style>