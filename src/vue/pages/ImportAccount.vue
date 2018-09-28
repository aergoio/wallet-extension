<template>
  <transition name="slide">
    <div class="page">
      <div class="sep top"></div>
      <div class="account-list-header">Import Account</div>

      <div class="scroll-view">
        <form class="form" autocomplete="off">
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

          <div class="form-line">
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
import {identifyFromPrivateKey, decodePrivateKey, decryptPrivateKey} from 'herajs-crypto';

export default {
  data () {
    return {
      file: null,
      password: '',
      key: '',
      identity: null,
      error: '',
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  mounted () {
  },
  methods: {
    async importAccount () {
      if (this.key) {
        const encryptedBytes = decodePrivateKey(this.key);
        try {
          const decryptedBytes = await decryptPrivateKey(encryptedBytes, this.password);
          this.identity = identifyFromPrivateKey(decryptedBytes);
        } catch(e) {
          this.error = 'Could not decrypt private key. Wrong password?';
        }
      }
      if (!this.file && !this.key) {
        this.error = 'Need to select either key file or paste text.';
        return;
      }

      console.log(this.identity);
      alert('Succesfully imported account ' + this.identity.address);

      /*onst account = await this.$store.dispatch('accounts/createAccount', {
        name: this.$data.name,
        password: this.$data.password
      });
      console.log('created account', account);
      this.$router.push('/');*/
    },
    selectedFile () {
      this.file = this.$refs.files.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target.result;
        const bytes = new Uint8Array(buffer);
        this.identity = identifyFromPrivateKey(bytes);
      };
      reader.readAsArrayBuffer(this.file);
    },
    cancel () {
      this.$router.push('/');
    }
  },
  components: {

  }
};
</script>

<style lang="scss">

</style>