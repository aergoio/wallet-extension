<template>
  <transition name="slide">
    <div class="page">
      <div class="seperator top"></div>
      <div class="account-list-header">Import Account</div>

      <div class="scroll-view">
        <div class="overlay-dialog create-result" :class="{visible: importedAddress}">
          <span class="icon icon-success"></span>

          <h2>The account has been imported.</h2>

          <p>You can identify your account by its address or picture.</p>

          <Identicon :text="importedAddress" />

          <p>{{importedAddress}}</p>

          <div class="form-actions">
            <Button text="View account" primary="true" v-on:click.native="gotoAccount" />
          </div>
        </div>

        <form class="form" autocomplete="off" v-if="!importedAddress">

          <div class="form-line">
            <label>
              Network

              <select class="text-input" v-model="selection">
                <option v-for="option in networkOptions" :key="option">{{option}}</option>
                <option value="other">Other...</option>
              </select>
            </label>
          </div>

          <div class="form-line">
            <label>
              Select file

              <input type="file" accept=".key" ref="files" v-on:change="selectedFile" style="width: 180px;">
            </label>
          </div>
          
          <div class="form-line">
            <label>
              OR Paste exported key

              <input type="text" class="text-input" v-model="key">
            </label>
          </div>

          <div class="form-line" v-if="keyType === 'encrypted'">
            <label>
              Password

              <input type="password" class="text-input" v-model="password" autocomplete="new-password">
            </label>
          </div>

          <div class="form-actions">
            <p v-if="error" class="error">{{error}}</p>
            <Button text="Import" primary="true" v-on:click.native="importAccount" />
            <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
          </div>
        </form>
      </div>
      
    </div>
  </transition>
</template>

<script>
import Identicon from '../components/Identicon';
import {identifyFromPrivateKey, decodePrivateKey, decryptPrivateKey} from '@herajs/crypto';
import bs58check from 'bs58check';
import { CHAINS, DEFAULT_CHAIN } from '../../controllers/chain-provider';

export default {
  data () {
    return {
      file: null,
      password: '',
      key: '',
      identity: null,
      error: '',
      keyType: '',
      importedAddress: '',
      selection: DEFAULT_CHAIN,
      chainId: '',
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
  mounted () {
  },
  watch: {
    key: function (key) {
      this.validateKey();
    },
    selection: async function(network) {
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
  methods: {
    async importAccount () {
      if (this.selection !== 'other') {
        this.chainId = this.selection;
      }
      if (!this.keyType) {
        this.error = 'Need to select either key file or paste text.';
        return;
      }
      if (this.keyType === 'encrypted') {
        const encryptedBytes = decodePrivateKey(this.key);
        try {
          const decryptedBytes = await decryptPrivateKey(encryptedBytes, this.password);
          this.identity = identifyFromPrivateKey(decryptedBytes);
        } catch(e) {
          console.log(e);
          this.error = 'Could not decrypt private key. Wrong password?';
          return;
        }
      }

      const result = await this.$store.dispatch('accounts/importAccount', {
        identity: this.identity,
        network: this.chainId
      });
      if (result.error) {
        this.error = '' + result.error;
        return;
      }
      console.log('created account', result);
      this.importedAddress = result.address;
    },
    validateKey () {
      try {
        const version = bs58check.decode(this.key)[0];
        if (version !== 0xAA) {
          this.error = 'Invalid key format';
          return;
        }
        this.keyType = 'encrypted';
      } catch (e) {
        console.error('Invalid key: ' + e);
        this.error = 'Invalid key format';
        this.keyType = '';
      }
    },
    selectedFile () {
      this.file = this.$refs.files.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target.result;
        const bytes = new Uint8Array(buffer);
        this.identity = identifyFromPrivateKey(bytes);
        this.keyType = 'file';
      };
      reader.readAsArrayBuffer(this.file);
    },
    gotoAccount () {
      const id = encodeURIComponent(`${this.chainId}/${this.importedAddress}`);
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

</style>