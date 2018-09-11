<template>
  <div id="app">
    <div class="page-container">
      <TransitionPage>
        <router-view></router-view>
      </TransitionPage>
    </div>
    <Footer />
  </div>
</template>

<script>
import Footer from './components/Footer';
import TransitionPage from './components/TransitionPage';

export default {
  data () {
    return {

    }
  },
  created() {

  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
   
  },
  components: {
    Footer,
    TransitionPage
  }
};
</script>

<style lang="scss">
#app {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .page-container {
      display: flex;
      flex-direction: column;
    }

    > div {
      flex: 1;

      &:last-child {
        flex: 0 0 auto;
      }
    }
}

.sep {
  background: linear-gradient(90deg, #4B64FF, #F91162);
  height: 1px;

  &.top {
    height: 4px;
  }
}

.box {
  background-color: #fff;
}

.page {
  background-color: #fff;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;

  flex: 100% 0 0;

  > * {
    flex: 0 0 auto;
  }

  .account-subpage {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
}

.scroll-view {
  flex: 1;
  overflow-y: auto;
}

</style>