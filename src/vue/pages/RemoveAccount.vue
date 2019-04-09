<template>
  <div class="scroll-view">
    <Dialog>
      <h1>Remove account</h1>
      <p>This will remove access to this account in this wallet. Make sure you have a backup or don't need this account anymore.</p>

      <div class="form-actions">

        <Button text="Remove" primary="true" v-on:click.native="remove" />
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '../components/Dialog';
import { promisifySimple } from '../../utils/promisify';
export default {
  data () {
    return {

    }
  },
  computed: {
    address() {
      return this.$route.params.address && this.$route.params.address.split('/')[1];
    },
    chainId() {
      return this.$route.params.address && this.$route.params.address.split('/')[0];
    }
  },
  methods: {
    async remove() {
      const nativeCheck = confirm(`Are you really sure you want to remove the account ${this.$route.params.address} from this wallet?`);
      if (!nativeCheck) return;
      await promisifySimple(this.$background.removeAccount)({
        chainId: this.chainId,
        address: this.address
      })
      this.$router.push('/');
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
</style>