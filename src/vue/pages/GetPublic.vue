<template>
  <div class="scroll-view">
    <PermissionRequest :url="request.request.senderURL" action="receive" object="your active account's public address and chain id" />

    <form class="form" autocomplete="off">
      
      <div v-if="!$route.params.address || $route.params.address === 'none'">
        <p class="error">Please select an account before continuing.</p>
      </div>

      <div>
        <div class="form-actions">
          <Button text="Confirm" primary="true" v-on:click.native="confirm" v-if="$route.params.address && $route.params.address !== 'none'" />
          <Button text="Deny" class="secondary" v-on:click.native="cancel" />
        </div>
      </div>

    </form>
  </div>
</template>

<script>
import { promisifySimple } from '../../utils/promisify';
import { Address } from '@herajs/client';
import { timedAsync } from 'timed-async';
import PermissionRequest from '../components/PermissionRequest';
import { mapState } from 'vuex';

export default {
  data () {
    return {
      error: ''
    };
  },

  components: {
    PermissionRequest,
  },

  computed: {
    ...mapState({
      request: state => state.navigation.activeRequest ? state.navigation.activeRequest : {},
    }),
    address() {
      return this.$route.params.address && this.$route.params.address.split('/').pop();
    },
    chainId() {
      const split = this.$route.params.address.split('/');
      split.pop();
      return this.$route.params.address && split.join('/');
    },
  },

  methods: {
    async confirm() {
      const account = {
        chainId: this.chainId,
        address: this.address,
      };
      await promisifySimple(this.$background.respondToPermissionRequest)({ requestId: this.request.requestId, result: { account, }});
      window.close();
    },
    async cancel() {
      await promisifySimple(this.$background.denyPermissionRequest)(this.request.requestId);
      window.close();
    }
  },
};
</script>

<style lang="scss">
.error {
  color: red;
}
</style>