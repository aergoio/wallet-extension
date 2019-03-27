<template>
  <div class="scroll-view">
    <Dialog>
      
      <div v-if="initialized">
        <div class="icon icon-lock"></div>
        <h1>Your wallet is locked.</h1>
        <p>Enter your wallet passphrase to unlock.</p>
        <form class="form" autocomplete="off" v-on:submit.prevent="unlock">
          
          <div class="form-actions">
            <input type="password" class="wallet-password" autofocus v-model="password" />
            
            <Button text="Unlock" primary="true" v-on:click.native="unlock" />
            <Button text="Reset wallet" class="secondary" v-on:click.native="reset" />

            <p v-if="error" class="error">{{error}}</p>
          </div>
        </form>
      </div>
      <div v-if="!initialized && !setupVisible">
        <div class="logo"></div>
        <h1>Welcome to Aergo Browser Wallet.</h1>
        <p>Use the wallet to manage your Aergo accounts in the browser.</p>
        <form class="form" autocomplete="off">
          <div class="form-actions">
            <Button text="Get started" primary="true" v-on:click.native="showSetup" />
          </div>
        </form>
      </div>
      <transition name="fade">
        <div v-if="!initialized && setupVisible">
          <div class="icon icon-lock"></div>
          <h1>Set up your new wallet.</h1>
          <p>To get started, please configure a passphrase for your wallet. This passphrase will be used to secure all your accounts.</p>
          <form class="form" autocomplete="off" v-on:submit.prevent="setup">
            
            <div class="form-actions">
              <input type="password" class="wallet-password" autofocus v-model="password" ref="passwordField" />
              
              <Button text="Set passphrase" primary="true" v-on:click.native="setup" />

              <p v-if="error" class="error">{{error}}</p>
            </div>
          </form>
        </div>
      </transition>
    </Dialog>
  </div>
</template>

<script>
import { promisifySimple } from '../../utils/promisify';
import Dialog from '../components/Dialog';
export default {
  props: [],
  data () {
    return {
      initialized: false,
      setupVisible: false,
      password: '',
      error: null
    }
  },
  async created () {
    await this.$db.open();
    this.initialized = !!await this.$db.getIndex('settings').get('encryptedId');
    console.log('wallet initialized', this.initialized);
  },
  mounted() {

  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
    reset () {
      this.$router.push('/reset');
    },
    showSetup() {
      this.setupVisible = true;
      setTimeout(() => {
        this.$refs.passwordField.focus();
      }, 1);
    },
    async setup() {
      this.error = null;
      if (!this.password) {
        this.error = "Password cannot be empty";
        return;
      }
      await promisifySimple(this.$background.setup)({password: this.password});
      this.initialized = true;
      this.password = '';
      
      this.$router.push('/');
    },
    async unlock() {
      this.error = null;
      if (!this.password) {
        this.error = "Password cannot be empty";
        return;
      }
      const result = await promisifySimple(this.$background.unlock)({password: this.password});
      if ('error' in result) {
        this.error = result.error;
        return;
      }
      let nextPath = this.$store.state.navigation.previousPath || '/';
      if (nextPath === '/locked') nextPath = '/';
      console.log("going to ", nextPath);
      this.$router.push(nextPath);
    }
  },
  components: {
    Dialog,
  }
};
</script>

<style lang="scss" scoped>

.icon-lock, .icon-aergo, .logo {
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

</style>