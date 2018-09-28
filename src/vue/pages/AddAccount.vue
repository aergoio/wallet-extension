<template>
  <transition name="slide">
    <div class="page">
      <div class="sep top"></div>
      <div class="account-list-header">Add Account</div>

      <div class="action-chooser">
        <router-link :to="`/add-account/create`">Create new account</router-link>
        <router-link :to="`/add-account/import`">Import account</router-link>
      </div>

      <div class="form-actions">
        <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
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
    cancel () {
      this.$router.push('/');
    }
  },
  components: {

  }
};
</script>

<style lang="scss">
.action-chooser {
  display: flex;
  flex-direction: column;
  margin: 15px;

  a {
    display: block;
    line-height: 3;
    text-align: center;
    text-decoration: none;
    color: inherit;
    background-color: #f0f0f0;
    margin-bottom: 10px;
    border-radius: 5px;

    &:hover {
      background-color: #e6e6e6;
    }
  }
}
</style>