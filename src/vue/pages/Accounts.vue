<template>
  <transition name="slide">
    <div class="page">
      <div class="sep top"></div>
      <div class="account-list-header">Select Active Account</div>
      <!--<button v-on:click="openPopup()">Expand</button>-->

      <div class="scroll-view">
        <ul class="account-list">
          <li v-for="account in accounts" :key="account.id">
            <router-link :to="`/account/${account.id}/`">
              <div class="account-item">
                <Identicon :text="account.id" />
                <span class="account-name">Account</span>
                <span class="account-balance" v-if="account && account.data">{{formatAmount(account.data.balance)}}</span><br />
                {{ account.id | shortAddress }}
              </div>
            </router-link>
          </li>
          <li>
            <router-link :to="`/add-account/`">
              <div class="account-item add-account">
                Add Account
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

import Identicon from '../components/Identicon';
import { Amount } from '@herajs/client';

export default {
  data () {
    return {
    }
  },
  created () {
    this.$store.dispatch('accounts/getAccounts');
  },
  beforeDestroy () {
  },
  computed: mapState({
    accounts: state => {
      return state.accounts.addresses.map(address => state.accounts.accounts[address]);
    }
  }),
  methods: {
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

  li {
    
    border-bottom: 1px solid #DFDFDF;

    a {
      display: block;
      text-decoration: none;
      color: inherit;
      padding: 12px 15px;
      overflow: auto;
    }

    &:hover {
      background-color: #f7f7f7;
    }

  }
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
</style>