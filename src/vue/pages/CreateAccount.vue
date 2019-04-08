<template>
  <transition name="slide">
    <div class="page">
      <div class="seperator top"></div>
      <div class="account-list-header">Create Account</div>

      <div class="scroll-view">

        <div class="overlay-dialog create-result" :class="{visible: state=='success'}">
          <span class="icon icon-success"></span>

          <h2>A new account has been created.</h2>

          <p>You can identify your account by its address or picture.</p>

          <Identicon :text="newAccount.address" />

          <p>{{newAccount.address}}</p>

          <div class="form-actions">
            <Button text="View account" primary="true" v-on:click.native="gotoAccount" />
          </div>
        </div>

        <form class="form" autocomplete="off" v-if="state == 'initial'">

          <div class="form-line">
            <label>
              Network

              <select class="text-input" v-model="selection">
                <option v-for="option in networkOptions" :key="option">{{option}}</option>
                <option value="other">Other...</option>
              </select>
            </label>
          </div>

          <div class="form-actions">
            <p v-if="error" class="error">{{error}}</p>
            <Button text="Create" primary="true" v-on:click.native="create" />
            <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
          </div>
        </form>
      
      </div>
      
    </div>
  </transition>
</template>

<script>
import { CHAINS, DEFAULT_CHAIN } from '../../controllers/chain-provider';

import Identicon from '../components/Identicon';
export default {
  data () {
    return {
      selection: DEFAULT_CHAIN,
      chainId: '',
      state: 'initial',
      newAccount: {},
      error: ''
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
    networkOptions() {
      return Object.keys(CHAINS);
    }
  },
  watch: {
    'selection': async function(network) {
      if (network === 'other') {
        const chainId = prompt('Please enter the Chain ID');
        const nodeUrl = prompt('Please enter the node URL (e.g. http://127.0.0.1:7845)');
        await this.$store.dispatch('accounts/addNetwork', {
          chainId, nodeUrl
        });
        this.chainId = chainId;
      }
    },
  },
  mounted () {
  },
  methods: {
    async create () {
      if (this.selection !== 'other') {
        this.chainId = this.selection;
      }
      this.newAccount = await this.$store.dispatch('accounts/createAccount', {
        network: this.chainId
      });
      console.log('created account', this.newAccount, this.chainId);

      this.state = 'success';
    },
    gotoAccount () {
      const id = encodeURIComponent(`${this.chainId}/${this.newAccount.address}`);
      this.$router.push(`/account/${id}/`);
    },
    cancel () {
      this.$router.push('/');
    }
  },
  components: {
    Identicon,
  }
};
</script>

<style lang="scss">
.create-result {
  .identicon svg {
    width: 80px;
    height: 80px;
  }
}

</style>