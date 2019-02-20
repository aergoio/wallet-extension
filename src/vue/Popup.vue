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
import { promisifySimple } from '../utils/promisify';

export default {
  data () {
    return {
      unlocked: false
    }
  },
  async created() {
    const unlocked = await promisifySimple(this.$background.isUnlocked)();
    console.log('unlocked', unlocked);
    this.unlocked = unlocked;
    if (!this.unlocked) {
      this.$router.push('/locked');
    }
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

.seperator {
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

    word-break: break-all;
  }
}

.scroll-view {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.form {
  margin: 10px;

  .form-line {
    padding: 5px 3px;

    border-bottom: 1px solid #DFDFDF;
    &:last-of-type {
      border-bottom: 0;
    }
  
    label {
      font-weight: 500;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    &.vertical label {
      flex-direction: column;
        align-items: stretch;

        .text-input {
          margin-top: 5px;
        }
    }
  }
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0 0;
}

.text-input {
  border: 1px solid #C6C6C6;
  border-radius: 4px;
  line-height: 20px;
  padding: 0 6px;
  font-weight: normal;

  &[disabled] {
    background-color: #f6f6f6;
  }
}

h2, strong {
  font-weight: 500;
  font-size: 1em;
}

h2 {
  margin: 15px 0 10px;
}

p { 
  line-height: 1.25;
}

.label {
  display: inline-block;
  vertical-align: text-bottom;
  text-transform: uppercase;
  font-size: .85em;
  background-color: #eee;
  line-height: 1.5;
  padding: 0 .4em;
  border-radius: 4px;

  &.label-positive {
    background-color: #13c329;
    color: #fff;
  }
  &.label-negative {
    background-color: #f57336;
    color: #fff;
  }
  &.label-action {
    font-weight: 500;
  }
}

.formatted-value {
  white-space: nowrap;

  &.token {
    background-color: #f0f0f0;
    padding: 0 3px;
  }
  .unit {

  }
  .value {
    font-weight: 500;
  }
  .sep {
    display: inline-block;
    width: 3px;
  }
  .point {
    display: inline-block;
  }
}

.overlay-dialog {
  background: #fff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  text-align: center;

  opacity: 0;
  transition: opacity .3s;
  pointer-events: none;
  &.visible {
    opacity: 1;
    pointer-events: all;
  }

  p {
    overflow-wrap: break-word;
    max-width: 100%;
  }
}

.icon, .logo {
  display: inline-block;
  vertical-align: text-bottom;
  width: 12px;
  height: 12px;
  background-repeat: no-repeat;
  background-size: contain;
  text-indent: -10000px;


  &.icon-view {
    background-image: url('~@assets/img/view.svg');
  }
  &.icon-success {
    width: 32px;
    height: 32px;
    background-image: url(~@assets/img/success.svg);
  }
  &.icon-lock {
    width: 25px;
    height: 34px;
    background-image: url(~@assets/img/lock.svg);
  }
  &.icon-aergo {
    width: 34px;
    height: 34px;
    background-image: url(~@assets/img/icon.svg);
  }
  &.icon-warning {
    width: 38px;
    height: 34px;
    background-image: url(~@assets/img/warning.svg);
  }
  &.icon-export {
    width: 25px;
    height: 29px;
    background-image: url(~@assets/img/export.svg);
  }
}
.logo {
  width: 108px;
  height: 46px;
  background-image: url(~@assets/img/aergo.svg);
}
</style>