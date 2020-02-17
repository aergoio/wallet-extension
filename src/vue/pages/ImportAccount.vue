<template>
  <transition name="slide">
    <div class="page">
      <div class="seperator top"></div>
      <div class="account-list-header">Import Account</div>

      <div class="scroll-view">

        <div v-if="!format">
          <p style="text-align: center">Please choose a format to import.</p>
          <div class="form-actions">
            <div class="choice-btn" @click="chooseFormat('keystore')">Keystore File</div>
            <p>This is the recommended format.</p>
            <div class="choice-btn" @click="chooseFormat('wif')">Import String</div>
            <p>This is a legacy format.</p>
          </div>
        </div>

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
        
        <form class="form" autocomplete="off" v-if="!importedAddress && format">

          <div class="form-line">
            <label>
              Network

              <select class="text-input" v-model="selection">
                <option v-for="option in networkOptions" :key="option">{{option}}</option>
                <option value="other">Other...</option>
              </select>
            </label>
          </div>

          <div class="form-line" v-if="format === 'wif'">
            <label>
              Paste exported key

              <input type="text" class="text-input" v-model="key">
            </label>
          </div>

          <div class="form-line" v-if="format === 'keystore'">
            <label>
              Select file

              <input type="file" accept=".txt" ref="files" v-on:change="selectedFile" style="width: 180px;">
            </label>
          </div>

          <div class="form-line">
            <label>
              Password

              <input type="password" class="text-input" v-model="password" autocomplete="new-password">
            </label>
          </div>

          <div class="form-actions">
            <p v-if="error" class="error">{{error}}</p>
            <Button :text="loading ? 'Please wait...' : 'Import'" primary="true" v-on:click.native="importAccount" />
            <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
import Identicon from '../components/Identicon';
import {identifyFromPrivateKey, decodePrivateKey, decryptPrivateKey, identityFromKeystore } from '@herajs/crypto';
import bs58check from 'bs58check';
import { CHAINS, DEFAULT_CHAIN } from '../../controllers/chain-provider';

export default {
  data () {
    return {
      password: '',
      key: '',
      identity: null,
      error: '',
      keyType: '',
      importedAddress: '',
      selection: DEFAULT_CHAIN,
      chainId: '',
      format: '',
      keystore: {},
      loading: false,
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
    key() {
      this.validateKey();
    },
    selection: async function(network) {
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
  methods: {
    chooseFormat(format) {
      this.format = format;
    },
    async importAccount () {
      if (this.selection !== 'other') {
        this.chainId = this.selection;
      }
      if (!this.keyType) {
        this.error = 'Need to input encrypted key.';
        return;
      }
      this.loading = true;
      setTimeout(async () => {
        if (this.keyType === 'encrypted') {
          const encryptedBytes = decodePrivateKey(this.key);
          try {
            const decryptedBytes = await decryptPrivateKey(encryptedBytes, this.password);
            this.identity = identifyFromPrivateKey(decryptedBytes);
          } catch(e) {
            console.log(e);
            this.error = 'Could not decrypt private key. Wrong password?';
            this.loading = false;
            return;
          }
        }
        if (this.keyType === 'file') {
          try {
            this.identity = await identityFromKeystore(this.keystore, this.password);
          } catch(e) {
            console.log(e);
            this.error = 'Could not decrypt keystore file. Wrong password?';
            this.loading = false;
            return;
          }
        }

        const result = await this.$store.dispatch('accounts/importAccount', {
          identity: this.identity,
          network: this.chainId
        });
        if (result.error) {
          this.error = '' + result.error;
          this.loading = false;
          return;
        }
        console.log('created account', result);
        this.importedAddress = result.address;
        this.loading = false;
      }, 150);
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
        this.keystore = JSON.parse(e.target.result);
        this.keyType = 'file';
      };
      reader.readAsText(this.file);
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
.choice-btn {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0 1.5em;
  line-height: 2.5em;
  font-size: 1.1em;
  cursor: pointer;
  &:hover {
    border-color: #FF36AD;
  }
}
</style>