<template>
  <transition name="slide">
    <div class="page">
      <div class="seperator top"></div>
      <div class="account-list-header">Create Account</div>

      <div class="scroll-view">
        <form class="form" autocomplete="off">

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
    },
  },
  watch: {
    'selection': async function(network) {
      if (network === 'other') {
        const chainId = prompt('Please enter the Chain ID');
        if (!chainId) {
          this.selection = DEFAULT_CHAIN;
          return;
        };
        const nodeUrl = prompt('Please enter the node URL (e.g. http://127.0.0.1:7845)');
        if (!nodeUrl) {
          this.selection = DEFAULT_CHAIN;
          return;
        };
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
      try {
        this.error = null;
        const newAccount = await this.$store.dispatch('accounts/createAccount', {
          network: this.chainId
        });
        console.log('created account', newAccount, this.chainId);
        const id = `${this.chainId}/${newAccount.address}`;
        this.$router.push({name: 'account-created', params: { address: id }});
      } catch (e) {
        this.error = e;
      }
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
