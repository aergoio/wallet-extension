<template>
  <transition name="slide">
    <div class="page">
      <div class="seperator top"></div>
      <div class="account-list-header">Select Active Account</div>

      <div class="scroll-view">
        <ul class="account-list">
          <li>
            <router-link :to="`/add-account/`">
              <div class="account-item add-account">
                Add Account
              </div>
            </router-link>
          </li>
          
          <li v-for="account in accounts" :key="account.id" v-on:mouseout.self="showAccountMenu(false)">
            <router-link :to="`/account/${encodeURIComponent(account.id)}/`">
              <div class="account-item">
                <Identicon :text="account.data.address" />
                
                <span>
                  <span class="account-name">Account</span>
                  <span class="account-balance" v-if="account && account.data">{{formatAmount(account.data.balance)}}</span><br />
                  <span class="account-address-chain">
                    <span class="address">{{ account.data.address | shortAddress(18) }}</span>
                    <span class="chain">{{ account.data.chain }}</span>
                  </span>
                </span>

                <span class="btn-action tooltipped tooltipped-no-delay tooltipped-w" v-tooltip="'More actions'" v-on:click.stop.prevent="showAccountMenu" >
                </span>

                <span class="account-menu" :class="{visible: accountMenuShown}">
                  <ul class="account-menu-items">
                    <li v-on:click.stop.prevent="gotoExplorer(account)">View in Aergoscan</li>
                    <li v-on:click.stop.prevent="gotoExport(account)">Export</li>
                    <li v-on:click.stop.prevent="gotoRemove(account)">Remove</li>
                  </ul>
                </span>
                
              </div>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { DEFAULT_CHAIN, chainProvider } from '../../controllers/chain-provider';
import Identicon from '../components/Identicon';
import { Amount } from '@herajs/client';

export default {
  data () {
    return {
      accountMenuShown: false
    }
  },
  created () {
    this.$store.dispatch('accounts/getAccounts');
  },
  beforeDestroy () {
  },
  computed: mapState({
    accounts: state => {
      const items = state.accounts.addresses.map(address => state.accounts.accounts[address]);
      //items.sort((a, b) => (new Amount(a.data.balance)).compare((new Amount(b.data.balance))));
      return items;
    }
  }),
  methods: {
    gotoExplorer(account) {
      window.open(chainProvider(DEFAULT_CHAIN).explorerUrl(`/account/${account.id}`));
    },
    gotoExport(account) {
      this.$router.push(`/account/${account.id}/export`);
    },
    gotoRemove(account) {
      this.$router.push(`/account/${account.id}/remove`);
    },
    showAccountMenu(state=true) {
      this.accountMenuShown = state;
    },
    openPopup() {
      chrome.tabs.create({url : "popup.html"});
    },
    formatAmount(amount) {
      if (!amount) return '0 aergo';
      return (new Amount(amount)).toUnit('aergo').toString();
    }
  },
  components: {
    Identicon
  }
};
</script>

<style lang="scss">
.account-list-header {
  text-align: center;
  color: #F81264;
  font-size: (11/12)*1em;
  line-height: 22px;
  border-bottom: 1px solid #DFDFDF;
}
.account-list {
  margin: 0;
  padding: 0;
  list-style: none;

  > li {
    
    border-bottom: 1px solid #DFDFDF;

    a {
      display: block;
      text-decoration: none;
      color: inherit;
      padding: 12px 15px;
    }

    &:hover {
      background-color: #f7f7f7;
    }

  }
}
.account-item .btn-action {
  visibility: hidden;
  float: right;
  width: 25px;
  height: 32px;
  background: url(~@assets/img/more.svg) 50% 50%;
  background-repeat: no-repeat;
  background-size: 5px auto;

  &:hover {
    background-image: url(~@assets/img/more-hover.svg);
  }
}
.account-item {
  position: relative;
}
.account-menu {
  position: absolute;
  top: 0;
  right: 10px;
  display: none;
  pointer-events: none;

  ul {
    display: block;
    margin: 0;
    padding: 0;
    background-color: #eee;
    border-radius: 5px;
    list-style: none;
    border: 1px solid #ddd;

    li {
      border-bottom: 1px solid #ddd;
      &:last-child { border-bottom: 0; }
      line-height: 2.5em;
      padding: 0 .75em;
      white-space: nowrap;
      &:hover {
        background-color: #e0e0e0;
      }
    }
  }
}
.account-list li:hover .btn-action {
  visibility: visible;
}
.account-list li:hover .account-menu.visible {
  display: block;
  pointer-events: all;
  z-index: 1;
}
.add-account {
  color: #F81264;
  background: url(~@assets/img/add.svg) 4px 50%;
  background-size: 23px 23px;
  background-repeat: no-repeat;
  padding-left: 38px;
  
  &.account-item {
    line-height: 23px;
  }
}

.chain {
  color: #444;
}
</style>