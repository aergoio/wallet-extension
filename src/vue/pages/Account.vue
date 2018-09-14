<template>
  <div class="page">
    <div class="sep top"></div>
    <div class="account-header">
      <div class="account-item">
        <Identicon :text="$route.params.address" />
        <span class="account-name">Account</span><br />
        {{ shortenAddress($route.params.address) }}
      </div>

      <router-link :to="`/`" class="menu-link"></router-link>

    </div>
    <div class="sep"></div>
    <ul class="account-nav">
      <li><router-link :to="`./`"><span>Deposit</span></router-link></li>
      <li><router-link :to="`send`"><span>Send</span></router-link></li>
      <li><router-link :to="`history`"><span>History</span></router-link></li>
    </ul>
    <div class="account-subpage">
      <TransitionPage>
        <router-view></router-view>
      </TransitionPage>
    </div>
  </div>
</template>

<script>
import TransitionPage from '../components/TransitionPage';
import Identicon from '../components/Identicon';

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
    shortenAddress(addr) {
      return addr.substr(0, 8) + '...' + addr.substr(addr.length-4);
    }
  },
  components: {
    TransitionPage,
    Identicon
  }
};
</script>

<style lang="scss">
.account-nav {
  font-size: (13/12)*1em;
  display: flex;
  list-style: none;
  margin: 10px 0;
  padding: 0;
  justify-content: stretch;

  li {
    flex: 1;
  
    a {
      display: block;
      text-align: center;
      text-decoration: none;
      color: inherit;
      text-transform: uppercase;
      
      span {
        border-bottom: 1px solid transparent;
        padding-bottom: 2px;
      }
      &.router-link-exact-active  span {
        border-color: #F8105F;
      }
    }
  }
}

.account-header {
  overflow: auto;
  padding: 12px 15px;
  display: flex;
  align-items: center;

  .account-item {
    flex: 1;
  }
}

.menu-link {
  width: 24px;
  height: 24px;
  background: url(~@assets/img/list.svg);
  background-size: 16px 14px;
  background-repeat: no-repeat;
  background-position: center center;
}

.account-name {
  font-weight: 500;
}

.account-item {
  line-height: 15px;

  .identicon {
    float: left;
    padding: 2px;
    border: 1px solid #979797;
    border-radius: 11px;
    margin-right: 7px;

    svg {
      display: block;
      width: 26px;
      height: 26px;
    }
  }
}

</style>