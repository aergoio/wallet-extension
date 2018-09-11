<template>
  <div class="scroll-view">
    <form class="form" autocomplete="off">
      <div class="form-line">
        <label>
          Recipient

          <input type="text" class="text-input" ref="address">
        </label>
      </div>

      <div class="form-line">
        <label>
          Amount

          <input type="password" class="text-input" >
        </label>
      </div>

      <div class="form-line">
        <label>
          Fee

          <input type="password" class="text-input" >
        </label>
      </div>

      <div class="form-line">
        <label>
          Data

          <input type="password" class="text-input" >
        </label>
      </div>

      <div class="form-actions">
        <Button text="Confirm" primary="true" v-on:click.native="create" />
        <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
  },
};
</script>

<style lang="scss">

</style>