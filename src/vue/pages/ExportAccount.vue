<template>
  <div class="scroll-view">
    <Dialog>
      <h1>Export account</h1>

      <div v-if="state=='format'">
        <p>Please choose a format.</p>
        <div class="form-actions">
          <div class="choice-btn" @click="chooseFormat('keystore')">Keystore File</div>
          <p>This is the recommended format.<br>Download your key as an encrypted file.</p>
          <div class="choice-btn" @click="chooseFormat('wif')">Import String</div>
          <p>This is a legacy format.<br>Copy your key as an encrypted string.</p>
        </div>
      </div>
      
      <div v-if="state=='input'">
        <p>Choose a passphrase for encryption.</p>
        <div class="form-actions">
          <input type="password" class="wallet-password" v-model="password" ref="passwordField" placeholder="Enter passphrase" />
          <Button :text="loading ? 'Please wait...' : 'Export'" :disabled="!loading" primary="true" v-on:click.native="exportAccount" />
        </div>
      </div>

      <div v-if="state=='result'">
        <div v-if="format === 'wif'">
          <p>You can now copy and save your encrypted private key.</p>
          <div class="export">{{exportedPrivateKey}}</div>
        </div>
        <div v-else>
          <p>A file download should have been started by your browser.</p>
          <div class="form-actions">
            <a class="btn" :download="fileName" target="_blank" :href="encodedKeystoreUrl" ref="downloadButton">Download again</a>
          </div>
        </div>
        <div class="form-actions">
          <Button text="Done" primary="true" v-on:click.native="goBack" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>

import Dialog from '../components/Dialog';
export default {
  data () {
    return {
      state: 'format',
      password: '',
      exportedPrivateKey: '',
      format: '',
      loading: false,
    }
  },
  computed: {
    fileName() {
      const address = this.$route.params.address.split('/')[1];
      return `${address}__keystore.txt`;
    },
    encodedKeystoreUrl() {
      return 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.exportedPrivateKey);
    },
  },
  methods: {
    async exportAccount() {
      const chainId = this.$route.params.address.split('/')[0];
      const address = this.$route.params.address.split('/')[1];
      this.loading = true;
      setTimeout(async () => {
        const result = await this.$store.dispatch('accounts/exportAccount', {
          address,
          chainId,
          password: this.password,
          format: this.format,
        });
        this.loading = false;
        this.exportedPrivateKey = result.privateKey;
        if (this.format === 'keystore') {
          setTimeout(() => {
            this.$refs.downloadButton.click();
          }, 150);
        }
        this.state = 'result';
      }, 150);
    },
    goBack() {
      this.$router.push(`/account/${encodeURIComponent(this.$route.params.address)}/`);
    },
    chooseFormat(format) {
      this.state = "input";
      this.format = format;
      setTimeout(() => {
        this.$refs.passwordField.focus();
      }, 100);
    }
  },
  components: {
    Dialog,
  }
};
</script>

<style lang="scss" scoped>
.icon-export {
  display: block;
  margin: 20px auto;
}
.wallet-password {
  display: block;
  margin: 0 0 25px;
  border-radius: 3px;
  border: 1px solid #aaa;
  font-size: 125%;
  padding: 5px;
  width: 100%;
  max-width: 200px;
}
.export {
  max-width: 20em;
  margin: 0 auto;
  background: #eaeaea;
  padding: 0.45em;
}
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