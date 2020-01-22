<template>
  <div class="scroll-view">
    <Dialog>
      <div class="icon icon-warning"></div>
      <h1>Reset wallet</h1>
      <p>Resetting your wallet will remove access to all your accounts.</p>
      <div v-if="accounts.length">
        <p>You will lose access to {{accounts.length}} accounts saved in this wallet. Make sure you have a backup or don't need these accounts anymore.</p>
        <ol class="address-list">
          <li v-for="account in accounts" :key="account.key">{{account.key}}</li>
        </ol>
      </div>
      <form class="form" autocomplete="off">
        
        <div class="form-actions">
          <Button text="Reset wallet" primary="true" v-on:click.native="reset" />
          <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script>
import { promisifySimple } from '../../utils/promisify';
import Dialog from '../components/Dialog';

import { mapState } from 'vuex'

export default {
  props: [],
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
    async reset() {
      const nativeCheck = confirm(`Are you really sure you want to remove all accounts from this wallet?`);
      if (!nativeCheck) return;
      await promisifySimple(this.$background.reset)();
      this.$router.push('/locked');
    },
    cancel() {
      this.$router.push('/');
    }
  },
  components: {
    Dialog,
  }
};
</script>

<style lang="scss" scoped>

.icon-warning {
  display: block;
  margin: 20px auto;
}
.address-list {
  padding: 0 0 0 1.5em;
  word-break: break-all;
}

</style>