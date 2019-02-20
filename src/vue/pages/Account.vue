<template>
  <div class="page">
    <div class="seperator top"></div>
    <div class="account-header">
      <div class="account-item">
        <Identicon :text="$route.params.address" />
        <span>
          <span class="account-name">Account</span>
          <span class="account-balance" v-if="account && account.data">{{formatAmount(account.data.balance)}}</span><br />
          {{ $route.params.address | shortAddress}}
        </span>
      </div>

      <router-link :to="`/`" class="menu-link"></router-link>

    </div>
    <div class="seperator"></div>
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
import { mapState } from 'vuex'
import { Amount } from '@herajs/client';


export default {
  data () {
    return {
      account: {},
      timeout: null
    }
  },
  created () {
  },
  mounted () {
    this.loadState();
    this.reloadState();
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  },
  methods: {
    formatAmount(amount) {
      return (new Amount(amount)).toUnit('aergo').toString();
    },
    async loadState() {
      await this.$db.open();
      this.account = await this.$db.accounts.get(this.$route.params.address)
      console.log('loaded account from db', this.account);
      this.timeout = setTimeout(() => {
        this.loadState();
      }, 10*1000);
    },
    async reloadState() {
      await this.$db.open();
      this.account = await this.$store.dispatch('accounts/loadAccount', { address: this.$route.params.address });
      console.log('loaded account from bg', this.account);
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
  display: flex;

  > :nth-child(2) {
    flex: 1;
  }

  .identicon {
    padding: 2px;
    border: 1px solid #aaa;
    border-radius: 8px;
    margin-right: 7px;

    svg {
      display: block;
      width: 26px;
      height: 26px;
    }
  }
}

</style>