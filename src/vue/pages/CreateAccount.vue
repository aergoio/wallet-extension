<template>
  <transition name="slide">
    <div class="page">
      <div class="sep top"></div>
      <div class="account-list-header">Create Account</div>

      <div class="scroll-view">
        <form class="form" autocomplete="off">
          <div class="form-line">
            <label>
              Accout name

              <input type="text" class="text-input" v-model="name" ref="name">
            </label>
          </div>

          <div class="form-line">
            <label>
              Password

              <input type="password" class="text-input" v-model="password" autocomplete="new-password">
            </label>
          </div>

          <div class="form-actions">
            <Button text="Create" primary="true" v-on:click.native="create" />
            <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
          </div>
        </form>
      </div>
      
    </div>
  </transition>
</template>

<script>
export default {
  data () {
    return {
      name: '',
      password: ''
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  mounted () {
    setTimeout(() => {
      this.$refs.name.focus();
    }, 400);
  },
  methods: {
    async create () {
      const account = await this.$store.dispatch('accounts/createAccount', {
        name: this.$data.name,
        password: this.$data.password
      });
      console.log('created account', account);
      this.$router.push('/');
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