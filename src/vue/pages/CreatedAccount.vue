<template>
  <transition name="slide">
    <div class="page">
      <div class="seperator top"></div>
      <div class="account-list-header">Create Account</div>

      <div class="scroll-view create-result">
        <span class="icon icon-success" style="margin-bottom: 5px;"></span>

        <h2>A new account has been created.</h2>

        <p class="backup-advice">
          If you plan on storing significant value in this account, 
          <span class="backup-warning">make a backup</span> by
          exporting it now!
        </p>
        <div class="form-actions" style="margin-bottom: 20px">
          <Button text="Export account" primary="true" v-on:click.native="gotoExportAccount" />
        </div>

        <Identicon :text="address" />

        <p style="word-break: break-all;">{{address}}</p>

        <div class="form-actions">
          <Button text="View account" primary="true" v-on:click.native="gotoAccount" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { CHAINS, DEFAULT_CHAIN } from '../../controllers/chain-provider';
import Identicon from '../components/Identicon';

export default {
  computed: {
    address() {
      return this.$route.params.address && this.$route.params.address.split('/').pop();
    },
    chainId() {
      if (!this.$route.params.address) return '';
      const split = this.$route.params.address.split('/');
      split.pop();
      return split.join('/');
    },
  },
  methods: {
    gotoAccount () {
      const id = `${this.chainId}/${this.address}`;
      this.$router.push({name: 'deposit', params: { address: id }});
    },
    gotoExportAccount () {
      const id = `${this.chainId}/${this.address}`;
      this.$router.push({name: 'account-export', params: { address: id }});
    },
  },
  components: {
    Identicon,
  }
};
</script>

<style lang="scss">
.create-result {
  text-align: center;
  padding: 20px;

  .identicon svg {
    width: 80px;
    height: 80px;
  }
}
.backup-advice {
  background-color: rgba(#FF36AD, 0.1);
  padding: 10px;
}
.backup-warning {
  font-weight: 500;
}
</style>