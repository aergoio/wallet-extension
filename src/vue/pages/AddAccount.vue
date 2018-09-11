<template>
  <transition name="slide">
    <div class="page">
      <div class="sep top"></div>
      <div class="account-list-header">Add Account</div>

      <div class="scroll-view">
        <form class="form">
          <div class="form-line">
            <label>
              Accout name

              <input type="text" class="text-input" v-model="name">
            </label>
          </div>

          <div class="form-line">
            <label>
              Password

              <input type="password" class="text-input" v-model="password">
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
import controller from '../../controller';

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
  methods: {
    async create () {
      const createdAddress = await controller.accounts.create(this.password);
      console.log('created account', createdAddress, this.password);
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