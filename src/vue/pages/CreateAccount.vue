<template>
  <transition name="slide">
    <div class="page">
      <div class="seperator top"></div>
      <div class="account-list-header">Create Account</div>

      <div class="scroll-view">

        <div class="overlay-dialog" :class="{visible: state=='success'}">
          <span class="icon icon-success"></span>

          <h2>A new account has been created.</h2>

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

  }
};
</script>

<style lang="scss">

</style>