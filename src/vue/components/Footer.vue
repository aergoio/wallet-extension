<template>
  <div id="footer">
    <a id="logo" href="https://aergo.io"></a>

    <div>
      <span class="network-selector-label">Network</span>
      <NetworkSelector />
    </div>
  </div>
</template>

<script>
import NetworkSelector from './NetworkSelector';

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
    openPopup() {
      chrome.tabs.create({url : "popup.html"});
    }
  },
  components: {
    NetworkSelector,
  }
};
</script>

<style lang="scss">
#footer {
  background-color: #E9E9E9;
  line-height: 23px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;

  > :last-child {
    align-self: flex-end;
  }
}

#logo {
  background: url('~@assets/img/logo.svg');
  width: 34px;
  height: 14px;
  background-size: auto 100%;
  background-repeat: no-repeat;
}

.network-selector-label {
  text-transform: uppercase;
  font-size: 75%;
  margin-right: 3px;

  &:after {
    content: ":";
  }
}
</style>