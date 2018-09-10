<template>
  <div id="app">
    <div>
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
    overflow: auto;

    > div {
      flex: 1;

      &:last-child {
        flex: unset;
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
}

</style>