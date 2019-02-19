<template>
  <div class="scroll-view">
    <Dialog>
      <h1>Export account</h1>
      <div v-if="state=='input'">
        <p>To export this account's private key,<br> choose a passphrase for encryption.</p>

        <div class="form-actions">
          <input type="password" class="wallet-password" v-model="password" ref="passwordField" placeholder="Enter passphrase" />

          <Button text="Export" primary="true" v-on:click.native="exportAccount" />
        </div>
      </div>
      <div v-if="state=='result'">
        <p>You can now copy and save your encrypted private key.</p>
        <div class="export">{{exportedPrivateKey}}</div>
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
      state: 'input',
      password: '',
      exportedPrivateKey: ''
    }
  },
  methods: {
    async exportAccount() {
      const result = await this.$store.dispatch('accounts/exportAccount', {
        id: this.$route.params.address,
        password: this.password
      });
      this.exportedPrivateKey = result.privateKey;
      console.log(this.exportedPrivateKey);
      this.state = 'result';
    },
    goBack() {
      this.$router.push(`/account/${this.$route.params.address}/`);
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
</style>