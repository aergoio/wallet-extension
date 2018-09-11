<template>
  <transition name="slide">
    <div class="page">
      <div class="sep top"></div>
      <div class="account-list-header">Select Active Account</div>
      <!--<button v-on:click="openPopup()">Expand</button>-->

      <div class="scroll-view">
        <ul class="account-list">
          <li v-for="account in accounts" :key="account.address">
            <router-link :to="`/account/${account.address}/`">
              <div class="account-item">
                <Identicon :text="account.address" />
                <span class="account-name">Account</span><br />
                {{account.address}}
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
import controller from '../../controller';

import Identicon from '../components/Identicon';

export default {
  data () {
    return {
      accounts: [
        {address: 'foo'},
        {address: 'bar'}
      ]
    }
  },
  created () {
    controller.accounts.get().then(accounts => {
      this.$data.accounts = accounts.map(address => ({address}));
    });
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