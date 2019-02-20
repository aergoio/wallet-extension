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
      
      </div>
      
    </div>
  </transition>
</template>

<script>
import Identicon from '../components/Identicon';
export default {
  data () {
    return {
      name: '',
      password: '',
      state: 'initial',
      newAccount: {}
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  mounted () {
    this.create();
  },
  methods: {
    async create () {
      console.log('Creating account...');
      this.newAccount = await this.$store.dispatch('accounts/createAccount', {
        name: this.$data.name,
        password: this.$data.password
      });
      console.log('created account', this.newAccount);

      this.state = 'success';
    },
    gotoAccount () {
      this.$router.push(`/account/${this.newAccount.address}/`);
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