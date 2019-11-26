<template>
  <div class="page">
    <div class="seperator top"></div>
    <div class="account-header">

      <router-link :to="`/`" class="menu-link"></router-link>

      <div class="account-item">
        <Identicon :text="account.data.spec.address" v-if="account && account.data" />
        <span class="account-item-text">
          <span class="account-name-balance">
            <span class="account-name" v-if="$route.params.address && $route.params.address !== 'none'">Account</span>
            <span class="account-name" v-if="$route.params.address === 'none'">No account selected</span>
            <span class="account-balance" v-if="account && account.data">{{formatAmount(account.data.balance)}}</span>
          </span>

          <span v-if="account && account.data" class="account-address-chain">
            <span class="address">{{ account.data.spec.address }}</span>
            <span class="chain" v-if="!explorerUrl">{{ account.data.spec.chainId }}</span>
            <span class="tooltipped tooltipped-no-delay tooltipped-s" v-tooltip="'Open in Explorer'" v-if="explorerUrl">
              <a class="external-link" :href="explorerUrl" target="_blank">
                <span class="chain">{{ account.data.spec.chainId }}</span>
              </a>
            </span>
          </span>
        </span>
      </div>
    </div>
    <div class="seperator"></div>
    <ul class="account-nav" v-if="!requestType">
      <li><router-link :to="`./`"><span>Deposit</span></router-link></li>
      <li><router-link :to="`send`"><span>Send</span></router-link></li>
      <li><router-link :to="`sign`"><span>Sign</span></router-link></li>
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
import { Amount } from '@herajs/client';
import { mapState } from 'vuex';
import { chainProvider } from '../../controllers/chain-provider';

export default {
  data () {
    return {
      account: {},
      timeout: null
    }
  },
  created () {
  },
  async mounted () {
    await this.loadState();
    this.reloadState();
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  },
  watch: {
    '$route.params.address'() {
      this.loadState();
    },
    account() {
      if (!this.account) return '';
      this.$store.dispatch('accounts/getChainInfo', { chainId: this.account.data.spec.chainId });
    },
  },
  computed: {
    ...mapState({
      requestType: state => state.navigation.activeRequest && state.navigation.activeRequest.request ? state.navigation.activeRequest.request.type : '',
    }),
    explorerUrl() {
      if (!this.account) return '';
      return chainProvider(this.account.data.spec.chainId).explorerUrl(`/account/${this.account.data.spec.address}`)
    },
  },
  methods: {
    formatAmount(amount) {
      return (new Amount(amount)).toUnit('aergo').toString();
    },
    async loadState() {
      if (this.$route.params.address === 'none') {
        this.account = {};
        return;
      }
      await this.$db.open();
      try {
        this.account = await this.$db.getIndex('accounts').get(this.$route.params.address)
        console.log('loaded account from db', this.account);
        this.timeout = setTimeout(() => {
          this.loadState();
        }, 10*1000);
      } catch(e) {
        this.$router.push(`/`);
      }
    },
    async reloadState() {
      if (!this.account || !this.account.data) return;
      await this.$db.open();
      this.account = await this.$store.dispatch('accounts/loadAccount', this.account.data.spec);
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
        border-color: #FF36AD;
      }
    }
  }
}

.account-header {
  padding: 12px 15px;
  display: flex;
  align-items: center;

  .account-item {
    flex: 1;
  }
}

.menu-link {
  flex: 28px 0 0;
  width: 28px;
  height: 28px;
  margin: 0 8px 0 -6px;
  background: url(~@assets/img/icon-arrow-left.svg);
  background-size: 24px;
  background-repeat: no-repeat;
  background-position: center center;

  border-radius: 100%;

  &:hover {
    background-color: #f4f4f4;
  }
}

.account-name {
  font-weight: 500;
}

.account-item {
  line-height: 15px;
  display: flex;

  .account-item-text {
    flex: 1;
    display: flex;
    flex-direction: column;

    .account-address-chain {
      white-space: nowrap;
      display: flex;
      max-width: 230px;

      .address {
        flex: 1;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }

  .identicon {
    padding: 2px;
    border: 1px solid #eee;
    margin-right: 7px;

    svg {
      display: block;
      width: 26px;
      height: 26px;
    }
  }
}



.external-link {
  text-decoration: none;
  padding-right: 20px;
  background: url(~@assets/img/icon-link.svg);
  background-size: 16px;
  background-repeat: no-repeat;
  background-position: 100% 0;
}

</style>